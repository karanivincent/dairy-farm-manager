export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SyncableEntity extends BaseEntity {
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  localId?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WORKER = 'worker',
  VIEWER = 'viewer',
}

export enum CattleStatus {
  ACTIVE = 'active',
  DRY = 'dry',
  PREGNANT = 'pregnant',
  SOLD = 'sold',
  DECEASED = 'deceased',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum MilkingSession {
  MORNING = 'morning',
  EVENING = 'evening',
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface Cattle extends SyncableEntity {
  tagNumber: string;
  name: string;
  breed?: string;
  birthDate?: Date;
  gender: Gender;
  status: CattleStatus;
  photoUrl?: string;
  parentBullId?: number;
  parentCowId?: number;
  metadata?: Record<string, any>;
}

export interface Production extends SyncableEntity {
  date: Date;
  cattleId: number;
  session: MilkingSession;
  quantity: number;
  recordedBy: number;
  notes?: string;
  qualityMetrics?: {
    fat?: number;
    protein?: number;
    temperature?: number;
  };
}

export interface HealthRecord extends SyncableEntity {
  cattleId: number;
  date: Date;
  type: 'vaccination' | 'treatment' | 'checkup' | 'deworming';
  description: string;
  veterinarianName?: string;
  medications?: string[];
  cost?: number;
  nextFollowUpDate?: Date;
}

export interface Financial extends SyncableEntity {
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod?: string;
  referenceNumber?: string;
  vendorOrCustomer?: string;
}