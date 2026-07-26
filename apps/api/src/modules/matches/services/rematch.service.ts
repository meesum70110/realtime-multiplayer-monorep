import { Injectable } from '@nestjs/common';

type RematchState = {
  matchId: string;
  player1UserId: string;
  player2UserId: string;
  requesterIds: Set<string>;
};

@Injectable()
export class RematchService {
  private readonly states = new Map<string, RematchState>();

  ensureState(
    matchId: string,
    player1UserId: string,
    player2UserId: string,
  ): RematchState {
    const existing = this.states.get(matchId);
    if (existing !== undefined) {
      return existing;
    }

    const created: RematchState = {
      matchId,
      player1UserId,
      player2UserId,
      requesterIds: new Set<string>(),
    };
    this.states.set(matchId, created);
    return created;
  }

  get(matchId: string): RematchState | null {
    return this.states.get(matchId) ?? null;
  }

  clear(matchId: string): void {
    this.states.delete(matchId);
  }

  /** Clears any rematch offers involving this user (used on disconnect / lobby). */
  clearForUser(userId: string): RematchState[] {
    const cleared: RematchState[] = [];
    for (const [matchId, state] of this.states) {
      if (
        state.player1UserId === userId ||
        state.player2UserId === userId ||
        state.requesterIds.has(userId)
      ) {
        cleared.push(state);
        this.states.delete(matchId);
      }
    }
    return cleared;
  }
}
