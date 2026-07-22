import { Socket } from 'socket.io';

import { UserEntity } from '../../modules/auth/entities/user.entity';

export type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    auth?: {
      sessionId: string;
      userId: string;
    };
    user?: UserEntity;
  };
};
