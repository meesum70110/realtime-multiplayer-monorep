import { randomUUID } from 'node:crypto';

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'duel_results' })
@Index('duel_results_pair_key_key', ['pairKey'], { unique: true })
export class DuelResultEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'item_a_id', type: 'uuid' })
  itemAId!: string;

  @Column({ name: 'item_b_id', type: 'uuid' })
  itemBId!: string;

  @Column({ name: 'pair_key', type: 'varchar', length: 255 })
  pairKey!: string;

  @Column({ name: 'winner_item_id', type: 'uuid', nullable: true })
  winnerItemId!: string | null;

  @Column({ name: 'winner_slot', type: 'varchar', length: 20, nullable: true })
  winnerSlot!: 'first' | 'second' | null;

  @Column({ name: 'result_type', type: 'varchar', length: 30, default: 'win' })
  resultType!: string;

  @Column({ name: 'battle_description', type: 'text' })
  battleDescription!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID();
  }
}
