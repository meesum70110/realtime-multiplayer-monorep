import { randomBytes } from 'node:crypto';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

type PrivateLobby = {
  code: string;
  hostUserId: string;
  createdAt: Date;
};

@Injectable()
export class PrivateLobbyService {
  private readonly lobbiesByCode = new Map<string, PrivateLobby>();
  private readonly codeByHostUserId = new Map<string, string>();

  create(hostUserId: string): PrivateLobby {
    this.cancelForUser(hostUserId);

    let code = this.generateCode();
    while (this.lobbiesByCode.has(code)) {
      code = this.generateCode();
    }

    const lobby: PrivateLobby = {
      code,
      hostUserId,
      createdAt: new Date(),
    };

    this.lobbiesByCode.set(code, lobby);
    this.codeByHostUserId.set(hostUserId, code);
    return lobby;
  }

  getByCode(code: string): PrivateLobby | null {
    return this.lobbiesByCode.get(this.normalizeCode(code)) ?? null;
  }

  takeForJoin(code: string, joinerUserId: string): PrivateLobby {
    const normalized = this.normalizeCode(code);
    const lobby = this.lobbiesByCode.get(normalized);

    if (lobby === undefined) {
      throw new NotFoundException('Private room not found');
    }

    if (lobby.hostUserId === joinerUserId) {
      throw new ConflictException('You cannot join your own private room');
    }

    this.lobbiesByCode.delete(normalized);
    this.codeByHostUserId.delete(lobby.hostUserId);
    return lobby;
  }

  cancelForUser(userId: string): { cancelled: boolean; code: string | null } {
    const code = this.codeByHostUserId.get(userId);
    if (code === undefined) {
      return { cancelled: false, code: null };
    }

    this.lobbiesByCode.delete(code);
    this.codeByHostUserId.delete(userId);
    return { cancelled: true, code };
  }

  private generateCode(): string {
    return randomBytes(3).toString('hex').toUpperCase();
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
