import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../../common/entities';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WORKER = 'worker',
  VIEWER = 'viewer',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.WORKER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Exclude()
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  // Virtual property
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Hash password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Validate password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}