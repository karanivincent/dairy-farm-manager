import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cattle } from '../../cattle/entities/cattle.entity';
import { User } from '../../users/entities/user.entity';

export enum MilkingSession {
  MORNING = 'morning',
  EVENING = 'evening',
}

export enum ProductionStatus {
  RECORDED = 'recorded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('productions')
@Index(['date', 'session'])
@Index(['cattleId', 'date'])
@Unique('UQ_production_cattle_date_session', ['cattleId', 'date', 'session'])
export class Production extends BaseEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: MilkingSession,
  })
  session: MilkingSession;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  quantity: number; // in liters

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  fatContent?: number; // percentage

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  proteinContent?: number; // percentage

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature?: number; // in celsius

  @Column({
    type: 'enum',
    enum: ProductionStatus,
    default: ProductionStatus.RECORDED,
  })
  status: ProductionStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics?: {
    somaticCellCount?: number;
    bacteriaCount?: number;
    lactoseContent?: number;
    [key: string]: any;
  };

  // Relations
  @ManyToOne(() => Cattle, { eager: true })
  @JoinColumn({ name: 'cattle_id' })
  cattle: Cattle;

  @Column()
  cattleId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by' })
  recordedBy: User;

  @Column()
  recordedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy?: User;

  @Column({ nullable: true })
  verifiedById?: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verifiedAt?: Date;

  // Calculated fields
  get milkValue(): number {
    // Base price calculation (can be enhanced with market prices)
    const basePrice = 0.50; // per liter
    const fatBonus = this.fatContent ? (this.fatContent - 3.5) * 0.02 : 0;
    const proteinBonus = this.proteinContent ? (this.proteinContent - 3.2) * 0.03 : 0;
    
    return this.quantity * (basePrice + fatBonus + proteinBonus);
  }

  get qualityGrade(): 'A' | 'B' | 'C' | null {
    if (!this.fatContent || !this.proteinContent) return null;
    
    const fatScore = this.fatContent >= 3.5 ? 2 : this.fatContent >= 3.0 ? 1 : 0;
    const proteinScore = this.proteinContent >= 3.2 ? 2 : this.proteinContent >= 2.8 ? 1 : 0;
    const totalScore = fatScore + proteinScore;
    
    if (totalScore >= 3) return 'A';
    if (totalScore >= 2) return 'B';
    return 'C';
  }

  get isHighQuality(): boolean {
    return this.qualityGrade === 'A';
  }
}