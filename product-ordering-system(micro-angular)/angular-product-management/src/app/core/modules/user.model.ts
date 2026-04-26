// Mirrors the ROLE_ prefix the backend stores in the users table
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  USER  = 'ROLE_USER'
}
 
// What we keep in localStorage / signal after login
export interface User {
  id         : number;
  username   : string;   // backend "username" field
  email      : string;
  roles      : string[]; // Set<String> from backend, e.g. ["ROLE_USER"]
  phoneNumber?: string;
  profilePicture?: string; // Cloudinary URL from backend "profilePicture"
  provider   ?: string;  // "LOCAL" | "GOOGLE" | "GITHUB"
}
 
// ── Auth request / response ──────────────────────────────────
 
// POST /api/auth/login  →  { username, password }
export interface LoginRequest {
  username: string;
  password: string;
}
 
// POST /api/auth/register
export interface RegisterRequest {
  username   : string;
  password   : string;
  email      : string;
  phoneNumber?: string;
  roles      ?: string[]; // optional; backend defaults to ["ROLE_USER"]
}
 
// Response from /api/auth/login and /api/auth/register
export interface AuthResponse {
  token       : string;
  refreshToken: string;
  type        : string;   // always "Bearer"
  username    : string;
  email       : string;
  roles       : UserRole;
  expiresIn   : number;   // ms
}
 
// POST /api/auth/refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}
 
// POST /api/auth/validate
export interface ValidateTokenRequest {
  token: string;
}
 
export interface ValidateTokenResponse {
  valid   : boolean;
  username: string;
  roles   : string[];
  message : string;
}
 
// ── Password flows (all public – no JWT) ────────────────────
 
// POST /api/password/forgot?email=...&method=email
export interface ForgotPasswordRequest {
  email : string;
  method?: 'email' | 'sms'; // default "email"
}
 
// POST /api/password/reset?identifier=...&otp=...&newPassword=...
export interface ResetPasswordRequest {
  identifier : string;  // email or phone
  otp        : string;
  newPassword: string;
}
 
// POST /api/password/change?email=...&currentPassword=...&newPassword=...
export interface ChangePasswordRequest {
  email          : string;
  currentPassword: string;
  newPassword    : string;
}
 
// ── Profile ──────────────────────────────────────────────────
 
// GET /api/profile/me
export interface ProfileResponse {
  id            : number;
  username      : string;
  email         : string;
  phoneNumber   : string;
  profilePicture: string;
  roles         : UserRole;
  provider      : string;
}
 
// PUT /api/profile/me
export interface UpdateProfileRequest {
  username    ?: string;
  phoneNumber ?: string;
}
 
// ── OTP ──────────────────────────────────────────────────────
 
export interface OtpVerifyRequest {
  identifier: string; // email or phone
  otp       : string;
}
 
// ── Helpers ──────────────────────────────────────────────────
 
/** Returns the display-friendly role label */
export function getRoleLabel(role: string): string {
  return role.replace('ROLE_', '').toLowerCase();
}
 
/** True if the user has ROLE_ADMIN in their roles array */
export function isAdminUser(user: User | null): boolean {
  return !!user?.roles?.includes(UserRole.ADMIN);
}