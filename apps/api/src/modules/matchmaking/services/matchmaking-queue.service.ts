import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { QueueStatus } from '../enums/queue-status.enum';
import { MatchmakingQueueEntry } from '../types/matchmaking-queue-entry.type';
import { MatchmakingModeSnapshot } from '../types/matchmaking-mode-snapshot.type';

@Injectable()
export class MatchmakingQueueService {
  private readonly entriesById = new Map<string, MatchmakingQueueEntry>();

  private readonly activeEntryIdByUserId = new Map<string, string>();

  private readonly waitingEntryIds: string[] = [];

  enqueue(userId: string, modeSnapshot: MatchmakingModeSnapshot): MatchmakingQueueEntry {
    const existingEntry = this.getActiveEntryForUser(userId);

    if (existingEntry !== null) {
      return existingEntry;
    }

    const now = new Date();
    const entry: MatchmakingQueueEntry = {
      cancelledAt: null,
      createdAt: now,
      id: randomUUID(),
      matchId: null,
      matchedAt: null,
      modeSnapshot: { ...modeSnapshot },
      status: QueueStatus.Waiting,
      updatedAt: now,
      userId,
    };

    this.entriesById.set(entry.id, entry);
    this.activeEntryIdByUserId.set(userId, entry.id);
    this.waitingEntryIds.push(entry.id);

    return entry;
  }

  getEntryForUserOrThrow(queueEntryId: string, userId: string): MatchmakingQueueEntry {
    const entry = this.entriesById.get(queueEntryId);

    if (entry === undefined || entry.userId !== userId) {
      throw new NotFoundException('Queue entry not found');
    }

    return entry;
  }

  getActiveEntryForUser(userId: string): MatchmakingQueueEntry | null {
    const entryId = this.activeEntryIdByUserId.get(userId);

    if (entryId === undefined) {
      return null;
    }

    return this.entriesById.get(entryId) ?? null;
  }

  listWaitingEntries(): MatchmakingQueueEntry[] {
    return this.waitingEntryIds
      .map((entryId) => this.entriesById.get(entryId) ?? null)
      .filter(
        (entry): entry is MatchmakingQueueEntry =>
          entry !== null && entry.status === QueueStatus.Waiting,
      );
  }

  markMatched(queueEntryId: string, matchId: string): MatchmakingQueueEntry {
    const entry = this.getRequiredEntry(queueEntryId);
    const now = new Date();

    entry.matchId = matchId;
    entry.matchedAt = now;
    entry.status = QueueStatus.Matched;
    entry.updatedAt = now;

    this.removeWaitingEntry(queueEntryId);

    return entry;
  }

  cancel(queueEntryId: string, userId: string): MatchmakingQueueEntry {
    const entry = this.getEntryForUserOrThrow(queueEntryId, userId);
    const now = new Date();

    entry.cancelledAt = now;
    entry.status = QueueStatus.Cancelled;
    entry.updatedAt = now;

    this.activeEntryIdByUserId.delete(userId);
    this.removeWaitingEntry(queueEntryId);

    return entry;
  }

  releaseEntriesForMatch(matchId: string): string[] {
    const matchedEntries = [...this.entriesById.values()].filter(
      (entry) => entry.matchId === matchId,
    );
    const releasedUserIds: string[] = [];

    for (const entry of matchedEntries) {
      if (this.activeEntryIdByUserId.get(entry.userId) === entry.id) {
        this.activeEntryIdByUserId.delete(entry.userId);
      }

      this.removeWaitingEntry(entry.id);
      this.entriesById.delete(entry.id);
      releasedUserIds.push(entry.userId);
    }

    return releasedUserIds;
  }

  getEstimatedWaitTimeSeconds(queueEntryId: string): number | null {
    const index = this.waitingEntryIds.indexOf(queueEntryId);

    if (index === -1) {
      return null;
    }

    return index * 30;
  }

  private getRequiredEntry(queueEntryId: string): MatchmakingQueueEntry {
    const entry = this.entriesById.get(queueEntryId);

    if (entry === undefined) {
      throw new NotFoundException('Queue entry not found');
    }

    return entry;
  }

  private removeWaitingEntry(queueEntryId: string): void {
    const entryIndex = this.waitingEntryIds.indexOf(queueEntryId);

    if (entryIndex !== -1) {
      this.waitingEntryIds.splice(entryIndex, 1);
    }
  }
}
