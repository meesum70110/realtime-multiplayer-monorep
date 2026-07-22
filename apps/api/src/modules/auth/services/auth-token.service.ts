import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AccessTokenPayload } from '../types/access-token-payload.type';

@Injectable()
export class AuthTokenService {
  constructor(private readonly configService: ConfigService) {}

  createAccessToken(input: {
    sessionId: string;
    userId: string;
  }): string {
    const expiresAt = new Date(
      Date.now() + this.getAccessTokenTtlMinutes() * 60 * 1000,
    );
    const payload: AccessTokenPayload = {
      exp: Math.floor(expiresAt.getTime() / 1000),
      sessionId: input.sessionId,
      sub: input.userId,
      type: 'access',
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = this.sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    const [encodedPayload, providedSignature] = token.split('.');

    if (
      encodedPayload === undefined ||
      providedSignature === undefined ||
      encodedPayload.length === 0 ||
      providedSignature.length === 0
    ) {
      return null;
    }

    const expectedSignature = this.sign(encodedPayload);

    if (!this.hasMatchingSignature(expectedSignature, providedSignature)) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<AccessTokenPayload>;

      if (
        payload.type !== 'access' ||
        typeof payload.sub !== 'string' ||
        typeof payload.sessionId !== 'string' ||
        typeof payload.exp !== 'number'
      ) {
        return null;
      }

      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        return null;
      }

      return {
        exp: payload.exp,
        sessionId: payload.sessionId,
        sub: payload.sub,
        type: 'access',
      };
    } catch {
      return null;
    }
  }

  createRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  createRefreshTokenExpiry(): Date {
    return new Date(Date.now() + this.getRefreshTokenTtlDays() * 24 * 60 * 60 * 1000);
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private sign(encodedPayload: string): string {
    return createHmac('sha256', this.getAccessTokenSecret())
      .update(encodedPayload)
      .digest('base64url');
  }

  private hasMatchingSignature(
    expectedSignature: string,
    providedSignature: string,
  ): boolean {
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(providedSignature);

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, providedBuffer);
  }

  private getAccessTokenSecret(): string {
    return this.configService.get<string>(
      'auth.accessTokenSecret',
      'change-me-before-production',
    );
  }

  private getAccessTokenTtlMinutes(): number {
    return this.configService.get<number>('auth.accessTokenTtlMinutes', 60);
  }

  private getRefreshTokenTtlDays(): number {
    return this.configService.get<number>('auth.refreshTokenTtlDays', 30);
  }
}
