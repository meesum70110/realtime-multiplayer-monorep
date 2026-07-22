export type AccessTokenPayload = {
  exp: number;
  sessionId: string;
  sub: string;
  type: 'access';
};
