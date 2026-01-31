import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

const AGENT_COOKIE_NAME = "propi_auth_token";
const USER_COOKIE_NAME = "propi_user_token";

export type UserType = "agent" | "user";

export interface JWTPayload {
  agentId: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

export interface UserJWTPayload {
  userId: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AGENT_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AGENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AGENT_COOKIE_NAME);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// ============================================
// USER (BUYER) AUTH FUNCTIONS
// ============================================

export async function signUserToken(payload: UserJWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyUserToken(token: string): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserJWTPayload;
  } catch {
    return null;
  }
}

export async function getUserSession(): Promise<UserJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyUserToken(token);
}

export async function setUserAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearUserAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}

export async function requireUserAuth(): Promise<UserJWTPayload> {
  const session = await getUserSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getOptionalUserSession(): Promise<UserJWTPayload | null> {
  return getUserSession();
}
