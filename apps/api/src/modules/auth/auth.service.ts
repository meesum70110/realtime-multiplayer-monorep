import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from './entities/user.entity';
import { AuthResponse } from './types/auth-response.type';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordHasherService } from './services/password-hasher.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    private readonly authTokenService: AuthTokenService,
    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async register(request: RegisterDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(request.email);
    const displayName = this.normalizeDisplayName(request.display_name);

    const user = this.usersRepository.create({
      email,
      displayName,
      displayNameNormalized: this.normalizeDisplayNameForLookup(displayName),
      passwordHash: await this.passwordHasherService.hashPassword(
        request.password,
      ),
    });

    try {
      const savedUser = await this.usersRepository.save(user);

      return this.issueSession(savedUser);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          this.resolveUniqueConstraintMessage(error),
        );
      }

      throw error;
    }
  }

  async login(request: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(request.email);
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user === null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await this.passwordHasherService.verifyPassword(
      request.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueSession(user);
  }

  private async issueSession(user: UserEntity): Promise<AuthResponse> {
    const refreshToken = this.authTokenService.createRefreshToken();

    const session = this.sessionsRepository.create({
      userId: user.id,
      tokenHash: this.authTokenService.hashRefreshToken(refreshToken),
      expiresAt: this.authTokenService.createRefreshTokenExpiry(),
    });

    const savedSession = await this.sessionsRepository.save(session);
    const accessToken = this.authTokenService.createAccessToken({
      sessionId: savedSession.id,
      userId: user.id,
    });

    return {
      user: this.toUserView(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeDisplayName(displayName: string): string {
    return displayName.trim().replace(/\s+/g, ' ');
  }

  private normalizeDisplayNameForLookup(displayName: string): string {
    return this.normalizeDisplayName(displayName).toLowerCase();
  }

  private toUserView(user: UserEntity): AuthResponse['user'] {
    return {
      id: user.id,
      display_name: user.displayName,
      email: user.email,
      role: user.role,
      total_matches_played: user.totalMatchesPlayed,
      total_wins: user.totalWins,
      total_losses: user.totalLosses,
      last_match_at: user.lastMatchAt?.toISOString() ?? null,
      created_at: user.createdAt.toISOString(),
    };
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === '23505'
    );
  }

  private resolveUniqueConstraintMessage(error: unknown): string {
    if (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'constraint' in error.driverError
    ) {
      if (error.driverError.constraint === 'users_email_key') {
        return 'Email is already registered';
      }

      if (error.driverError.constraint === 'users_display_name_normalized_key') {
        return 'Display name is already taken';
      }
    }

    return 'User already exists';
  }
}
