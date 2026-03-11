export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
