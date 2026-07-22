import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

import { Injectable } from '@nestjs/common';

const SCRYPT_KEY_LENGTH = 64;

@Injectable()
export class PasswordHasherService {
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await this.deriveKey(password, salt);

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, hashedValue] = storedHash.split(':');

    if (
      algorithm !== 'scrypt' ||
      salt === undefined ||
      hashedValue === undefined
    ) {
      return false;
    }

    const derivedKey = await this.deriveKey(password, salt);
    const hashedBuffer = Buffer.from(hashedValue, 'hex');

    if (derivedKey.length !== hashedBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, hashedBuffer);
  }

  private deriveKey(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey as Buffer);
      });
    });
  }
}
