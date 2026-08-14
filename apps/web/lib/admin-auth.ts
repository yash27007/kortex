import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// Fails loudly in production instead of silently falling back to a
// guessable default — a hardcoded admin password/JWT secret checked into
// a public repo is a real backdoor for anyone who deploys without setting
// these. Development keeps a documented, clearly-insecure default so a
// fresh clone still runs without extra setup.
//
// Evaluated lazily (called from inside each function below, not at module
// load) so `next build`'s route-collection pass — which imports this module
// under NODE_ENV=production without ever invoking the handlers — doesn't
// trip the production check itself. The real check is what fires when a
// request actually reaches the admin login route at runtime.
function requireAdminEnv(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `${name} must be set in production — refusing to start with an insecure default.`
    );
  }

  console.warn(
    `[admin-auth] ${name} is not set. Using an insecure development-only default — set it in apps/web/.env.local before deploying.`
  );
  return devFallback;
}

function getAdminSecret(): string {
  return requireAdminEnv('ADMIN_SECRET', 'dev-only-insecure-secret-change-me');
}

function getAdminEmail(): string {
  return requireAdminEnv('ADMIN_EMAIL', 'admin@kortex.com');
}

function getAdminPassword(): string {
  return requireAdminEnv('ADMIN_PASSWORD', 'admin123');
}

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
  const secretKey = new TextEncoder().encode(getAdminSecret());

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
    const secretKey = new TextEncoder().encode(getAdminSecret());
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
  return email === getAdminEmail() && password === getAdminPassword();
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null && session.isAdmin === true;
}




