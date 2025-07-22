import Dexie, { type Table } from 'dexie';

export type SyncStatus = 'synced' | 'pending' | 'conflict';

export interface DBCattle {
  id?: number;
  serverId?: number;
  tagNumber: string;
  name: string;
  breed?: string;
  birthDate?: Date;
  gender: 'male' | 'female';
  status: 'active' | 'dry' | 'pregnant' | 'sold' | 'deceased';
  parentBullId?: number;
  parentCowId?: number;
  photoUrl?: string;
  metadata?: Record<string, any>;
  syncStatus: SyncStatus;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBProduction {
  id?: number;
  serverId?: number;
  date: Date;
  session: 'morning' | 'evening';
  quantity: number;
  cattleId: number;
  recordedBy: number;
  notes?: string;
  qualityMetrics?: {
    fat?: number;
    protein?: number;
    temperature?: number;
  };
  syncStatus: SyncStatus;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBUser {
  id?: number;
  serverId?: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'manager' | 'worker';
  isActive: boolean;
  syncStatus: SyncStatus;
  lastModified: Date;
}

export interface SyncQueueItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  entityType: 'cattle' | 'production' | 'user';
  entityId: number;
  data?: any;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

export interface AppSettings {
  id?: number;
  key: string;
  value: any;
  updatedAt: Date;
}

export class FarmDatabase extends Dexie {
  cattle!: Table<DBCattle>;
  productions!: Table<DBProduction>;
  users!: Table<DBUser>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<AppSettings>;

  constructor() {
    super('FarmDatabase');

    this.version(1).stores({
      cattle: '++id, serverId, tagNumber, status, syncStatus, lastModified',
      productions: '++id, serverId, date, cattleId, session, syncStatus, lastModified',
      users: '++id, serverId, email, username, role, syncStatus',
      syncQueue: '++id, entityType, timestamp, retryCount',
      settings: '++id, key',
    });

    // Add hooks for automatic timestamping
    this.cattle.hook('creating', (_primKey, obj, _trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.lastModified = now;
      if (!obj.syncStatus) obj.syncStatus = 'pending';
    });

    this.cattle.hook('updating', (modifications, _primKey, _obj, _trans) => {
      const now = new Date();
      (modifications as any).updatedAt = now;
      (modifications as any).lastModified = now;
      if ((modifications as any).syncStatus !== 'synced') {
        (modifications as any).syncStatus = 'pending';
      }
    });

    this.productions.hook('creating', (_primKey, obj, _trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.lastModified = now;
      if (!obj.syncStatus) obj.syncStatus = 'pending';
    });

    this.productions.hook('updating', (modifications, _primKey, _obj, _trans) => {
      const now = new Date();
      (modifications as any).updatedAt = now;
      (modifications as any).lastModified = now;
      if ((modifications as any).syncStatus !== 'synced') {
        (modifications as any).syncStatus = 'pending';
      }
    });
  }

  // Helper methods for sync operations
  async getPendingChanges(entityType: string) {
    switch (entityType) {
      case 'cattle':
        return this.cattle.where('syncStatus').equals('pending').toArray();
      case 'production':
        return this.productions.where('syncStatus').equals('pending').toArray();
      case 'user':
        return this.users.where('syncStatus').equals('pending').toArray();
      default:
        return [];
    }
  }

  async markAsSynced(entityType: string, localId: number, serverId: number) {
    const now = new Date();
    switch (entityType) {
      case 'cattle':
        await this.cattle.update(localId, {
          serverId,
          syncStatus: 'synced',
          lastModified: now,
        });
        break;
      case 'production':
        await this.productions.update(localId, {
          serverId,
          syncStatus: 'synced',
          lastModified: now,
        });
        break;
      case 'user':
        await this.users.update(localId, {
          serverId,
          syncStatus: 'synced',
          lastModified: now,
        });
        break;
    }
  }

  async addToSyncQueue(action: SyncQueueItem['action'], entityType: SyncQueueItem['entityType'], entityId: number, data?: any) {
    await this.syncQueue.add({
      action,
      entityType,
      entityId,
      data,
      timestamp: new Date(),
      retryCount: 0,
    });
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settings.where('key').equals(key).first();
    return setting?.value;
  }

  async setSetting(key: string, value: any) {
    const existing = await this.settings.where('key').equals(key).first();
    const now = new Date();
    
    if (existing) {
      await this.settings.update(existing.id!, { value, updatedAt: now });
    } else {
      await this.settings.add({ key, value, updatedAt: now });
    }
  }
}

export const db = new FarmDatabase();