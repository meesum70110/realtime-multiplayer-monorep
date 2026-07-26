import { Socket } from 'socket.io';

import { UserEntity } from '../../modules/auth/entities/user.entity';

export type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    auth?: {
      /** Null for anonymous guest sockets that connected without a token. */
      sessionId: string | null;
      userId: string;
      isGuest?: boolean;
    };
    user?: UserEntity;
  };
};
