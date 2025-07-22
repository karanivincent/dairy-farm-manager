// Data Transfer Objects for API communication

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface CreateCattleDto {
  tagNumber: string;
  name: string;
  breed?: string;
  birthDate?: string;
  gender: string;
  status?: string;
  parentBullId?: number;
  parentCowId?: number;
}

export interface UpdateCattleDto extends Partial<CreateCattleDto> {
  photoUrl?: string;
}

export interface CreateProductionDto {
  date: string;
  cattleId: number;
  session: string;
  quantity: number;
  notes?: string;
}

export interface ProductionSummary {
  date: string;
  totalMorning: number;
  totalEvening: number;
  totalDaily: number;
  cowCount: number;
  averagePerCow: number;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SyncDto {
  entities: {
    cattle?: any[];
    productions?: any[];
    health?: any[];
    financial?: any[];
  };
  lastSyncTimestamp: string;
  deviceId: string;
}

export interface SyncResponse {
  success: boolean;
  conflicts: any[];
  updates: {
    cattle?: any[];
    productions?: any[];
    health?: any[];
    financial?: any[];
  };
  newSyncTimestamp: string;
}