export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum CattleStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  DECEASED = 'deceased',
  DRY = 'dry',
  PREGNANT = 'pregnant',
  CULLED = 'culled',
}

export interface Cattle {
  id: number;
  tagNumber: string;
  name: string;
  breed?: string;
  birthDate?: string;
  gender: Gender;
  status: CattleStatus;
  parentBullId?: number;
  parentCowId?: number;
  parentBull?: Cattle;
  parentCow?: Cattle;
  photoUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CattleFilterDto {
  status?: CattleStatus;
  gender?: Gender;
  breed?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'tagNumber' | 'birthDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCattleDto {
  tagNumber: string;
  name: string;
  breed?: string;
  birthDate?: string;
  gender: Gender;
  status?: CattleStatus;
  parentBullId?: number;
  parentCowId?: number;
  photoUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCattleDto {
  tagNumber?: string;
  name?: string;
  breed?: string;
  birthDate?: string;
  gender?: Gender;
  status?: CattleStatus;
  parentBullId?: number;
  parentCowId?: number;
  photoUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CattleFormData {
  tagNumber: string;
  name: string;
  breed: string;
  birthDate: string;
  gender: Gender | '';
  parentBullId?: number | '';
  parentCowId?: number | '';
  photo?: File;
}