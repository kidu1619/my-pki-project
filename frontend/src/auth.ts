/**
 * auth.ts — JWT token helper for the PKI frontend.
 *
 * Authentication is handled entirely by the Spring Boot backend
 * (BCrypt password hashing + self-signed RSA JWT).
 *
 * This module provides lightweight helpers to store/retrieve/clear
 * the JWT from localStorage and expose the current user's info.
 */

const TOKEN_KEY = "pki_jwt_token";

/** Persist a JWT returned by POST /api/auth/login */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Retrieve the stored JWT, or null if not logged in */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Remove the JWT (logout) */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Returns true when a JWT is present in storage */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Decode the JWT payload (base64url) to extract user info.
 * This does NOT verify the signature — validation happens on the backend.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Extract the username (JWT subject) from the stored token */
export function getCurrentUsername(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodePayload(token);
  return payload ? (payload["sub"] as string) : null;
}

/** Extract the roles array from the stored token */
export function getCurrentRoles(): string[] {
  const token = getToken();
  if (!token) return [];
  const payload = decodePayload(token);
  if (!payload) return [];
  const roles = payload["roles"];
  return Array.isArray(roles) ? (roles as string[]) : [];
}

/** Returns true if the stored token is expired (client-side check) */
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload || typeof payload["exp"] !== "number") return true;
  return Date.now() >= payload["exp"] * 1000;
}
