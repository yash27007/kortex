import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-secret-key-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kortex.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const secretKey = new TextEncoder().encode(ADMIN_SECRET);
const COOKIE_NAME = 'admin-session';

export interface AdminSession {
  email: string;
  isAdmin: true;
  expiresAt: number;
}

/**
 * Create an admin session token
 */
export async function createAdminSession(email: string): Promise<string> {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const token = await new SignJWT({ email, isAdmin: true, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode admin session token
 */
export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // Token expired
    }

    if (payload.isAdmin === true && typeof payload.email === 'string') {
      return {
        email: payload.email,
        isAdmin: true,
        expiresAt: (payload.exp || 0) * 1000,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get admin session from cookies
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSession(token);
}

/**
 * Set admin session cookie
 */
export async function setAdminSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

/**
 * Clear admin session
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Validate admin credentials
 */
export function validateAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null && session.isAdmin === true;
}




