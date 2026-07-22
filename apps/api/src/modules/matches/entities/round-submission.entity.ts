import { randomUUID } from 'node:crypto';

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from '../../auth/entities/user.entity';
import { ItemEntity } from './item.entity';
import { RoundEntity } from './round.entity';

@Entity({ name: 'round_submissions' })
@Index('round_submissions_round_user_key', ['roundId', 'userId'], {
  unique: true,
})
export class RoundSubmissionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'round_id', type: 'uuid' })
  roundId!: string;

  @ManyToOne(() => RoundEntity, (round) => round.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'round_id' })
  round!: RoundEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => ItemEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'item_id' })
  item!: ItemEntity;

  @Column({ name: 'raw_input', type: 'varchar', length: 100 })
  rawInput!: string;

  @Column({ name: 'normalized_input', type: 'varchar', length: 100 })
  normalizedInput!: string;

  @Column({ name: 'is_locked', type: 'boolean', default: true })
  isLocked!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt!: Date | null;

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID();
  }
}
