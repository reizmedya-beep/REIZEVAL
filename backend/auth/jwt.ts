import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reiz_super_secret_enterprise_jwt_key_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'reiz_super_secret_refresh_token_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'SYSTEM_ADMIN' | 'GLOBAL_CTO' | 'TECHNICAL_JURY' | 'DEVELOPER';
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
