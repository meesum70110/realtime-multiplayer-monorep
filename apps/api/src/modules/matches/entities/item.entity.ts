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

import { ItemIconStatus } from './item-icon-status.enum';

@Entity({ name: 'items' })
@Index('items_normalized_name_key', ['normalizedName'], { unique: true })
export class ItemEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'raw_input_example', type: 'varchar', length: 100 })
  rawInputExample!: string;

  @Column({ name: 'normalized_name', type: 'varchar', length: 100 })
  normalizedName!: string;

  @Column({ name: 'is_valid', type: 'boolean', default: true })
  isValid!: boolean;

  @Column({ name: 'blocked_reason', type: 'varchar', length: 100, nullable: true })
  blockedReason!: string | null;

  @Column({ name: 'power_level', type: 'integer', nullable: true })
  powerLevel!: number | null;

  @Column({ name: 'theme_tags', type: 'simple-json', nullable: true })
  themeTags!: string[] | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 255, nullable: true })
  iconUrl!: string | null;

  @Column({
    name: 'icon_status',
    type: 'varchar',
    length: 30,
    default: ItemIconStatus.Pending,
  })
  iconStatus!: ItemIconStatus;

  @Column({ name: 'metadata_json', type: 'simple-json', nullable: true })
  metadataJson!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID();
  }
}
