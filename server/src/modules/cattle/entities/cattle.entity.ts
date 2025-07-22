import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

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

@Entity('cattle')
@Index(['tagNumber'], { unique: true })
@Index(['status'])
@Index(['breed'])
export class Cattle extends BaseEntity {
  @Column({ unique: true, length: 50 })
  tagNumber: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  breed?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: CattleStatus,
    default: CattleStatus.ACTIVE,
  })
  status: CattleStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ length: 500, nullable: true })
  photoUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Self-referencing relationships for parents
  @ManyToOne(() => Cattle, { nullable: true })
  @JoinColumn({ name: 'parent_bull_id' })
  parentBull?: Cattle;

  @Column({ nullable: true })
  parentBullId?: number;

  @ManyToOne(() => Cattle, { nullable: true })
  @JoinColumn({ name: 'parent_cow_id' })
  parentCow?: Cattle;

  @Column({ nullable: true })
  parentCowId?: number;

  // Offspring relationships
  @OneToMany(() => Cattle, (cattle) => cattle.parentBull)
  offspringAsBull: Cattle[];

  @OneToMany(() => Cattle, (cattle) => cattle.parentCow)
  offspringAsCow: Cattle[];

  // Calculated fields
  get age(): number | null {
    if (!this.birthDate) return null;
    
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  get ageInMonths(): number | null {
    if (!this.birthDate) return null;
    
    const today = new Date();
    const birth = new Date(this.birthDate);
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  }

  get isAdult(): boolean {
    const ageInMonths = this.ageInMonths;
    return ageInMonths !== null && ageInMonths >= 24; // 2 years
  }

  get canMilk(): boolean {
    return this.gender === Gender.FEMALE && 
           this.status === CattleStatus.ACTIVE && 
           this.isAdult;
  }
}