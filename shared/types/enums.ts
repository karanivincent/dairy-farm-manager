export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WORKER = 'worker',
  VIEWER = 'viewer',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum CattleStatus {
  ACTIVE = 'active',
  PREGNANT = 'pregnant',
  DRY = 'dry',
  SICK = 'sick',
  SOLD = 'sold',
  DECEASED = 'deceased',
  QUARANTINE = 'quarantine',
}

export enum MilkingSession {
  MORNING = 'morning',
  EVENING = 'evening',
}

export enum ProductionStatus {
  RECORDED = 'recorded',
  PENDING = 'pending',
  VERIFIED = 'verified',
}