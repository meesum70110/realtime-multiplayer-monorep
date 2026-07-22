import { Request } from 'express';

import { UserEntity } from '../../modules/auth/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  auth?: {
    accessToken: string;
    sessionId: string;
    userId: string;
  };
  user?: UserEntity;
}
