import { randomUUID } from 'node:crypto';

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from '../../auth/entities/user.entity';
import { MatchEntity } from './match.entity';
import { RoundStatus } from './round-status.enum';
import { RoundSubmissionEntity } from './round-submission.entity';

@Entity({ name: 'rounds' })
export class RoundEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId!: string;

  @ManyToOne(() => MatchEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match!: MatchEntity;

  @Column({ name: 'round_number', type: 'integer' })
  roundNumber!: number;

  @Column({ name: 'round_status', type: 'varchar', length: 30 })
  roundStatus!: RoundStatus;

  @Column({ name: 'winner_user_id', type: 'uuid', nullable: true })
  winnerUserId!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'winner_user_id' })
  winnerUser!: UserEntity | null;

  @Column({ name: 'battle_description', type: 'text', nullable: true })
  battleDescription!: string | null;

  @OneToMany(() => RoundSubmissionEntity, (submission) => submission.round)
  submissions!: RoundSubmissionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt!: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID();
  }
}
