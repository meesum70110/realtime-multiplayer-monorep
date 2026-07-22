import { randomUUID } from 'node:crypto';

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from '../../auth/entities/user.entity';
import { LevelModeType } from './level-mode-type.enum';
import { MatchModeType } from './match-mode-type.enum';
import { MatchRuleType } from './match-rule-type.enum';
import { MatchStatus } from './match-status.enum';

@Entity({ name: 'matches' })
export class MatchEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'mode_type', type: 'varchar', length: 20 })
  modeType!: MatchModeType;

  @Column({ name: 'match_status', type: 'varchar', length: 30 })
  matchStatus!: MatchStatus;

  @Column({ name: 'player_1_user_id', type: 'uuid' })
  player1UserId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'player_1_user_id' })
  player1User!: UserEntity;

  @Column({ name: 'player_2_user_id', type: 'uuid' })
  player2UserId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'player_2_user_id' })
  player2User!: UserEntity;

  @Column({ name: 'player_1_score', type: 'integer', default: 0 })
  player1Score!: number;

  @Column({ name: 'player_2_score', type: 'integer', default: 0 })
  player2Score!: number;

  @Column({
    name: 'player_1_remaining_points',
    type: 'integer',
    nullable: true,
  })
  player1RemainingPoints!: number | null;

  @Column({
    name: 'player_2_remaining_points',
    type: 'integer',
    nullable: true,
  })
  player2RemainingPoints!: number | null;

  @Column({ name: 'best_of', type: 'integer' })
  bestOf!: number;

  @Column({ name: 'round_time_limit_seconds', type: 'integer' })
  roundTimeLimitSeconds!: number;

  @Column({ name: 'rule_type', type: 'varchar', length: 30 })
  ruleType!: MatchRuleType;

  @Column({ name: 'theme_name', type: 'varchar', length: 100, nullable: true })
  themeName!: string | null;

  @Column({
    name: 'level_mode_type',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  levelModeType!: LevelModeType | null;

  @Column({ name: 'level_min', type: 'integer', nullable: true })
  levelMin!: number | null;

  @Column({ name: 'level_max', type: 'integer', nullable: true })
  levelMax!: number | null;

  @Column({
    name: 'total_points_per_player',
    type: 'integer',
    nullable: true,
  })
  totalPointsPerPlayer!: number | null;

  @Column({ name: 'winner_user_id', type: 'uuid', nullable: true })
  winnerUserId!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'winner_user_id' })
  winnerUser!: UserEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt!: Date | null;

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID();
  }
}
