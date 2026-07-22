import { randomUUID } from 'node:crypto';

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SessionEntity } from './session.entity';
import { UserRole } from './user-role.enum';

@Entity({ name: 'users' })
@Index('users_email_key', ['email'], { unique: true })
@Index('users_display_name_normalized_key', ['displayNameNormalized'], {
  unique: true,
})
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 40 })
  displayName!: string;

  @Column({
    name: 'display_name_normalized',
    type: 'varchar',
    length: 40,
  })
  displayNameNormalized!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.Player,
  })
  role!: UserRole;

  @Column({ name: 'total_matches_played', type: 'integer', default: 0 })
  totalMatchesPlayed!: number;

  @Column({ name: 'total_wins', type: 'integer', default: 0 })
  totalWins!: number;

  @Column({ name: 'total_losses', type: 'integer', default: 0 })
  totalLosses!: number;

  @Column({ name: 'last_match_at', type: 'timestamptz', nullable: true })
  lastMatchAt!: Date | null;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions!: SessionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID();
  }
}
