export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  USER  = 'ROLE_USER'
}

export interface User {
  profilePicture?: any;
  provider?: string;
  id: number;
  username: string;
  email: string;
  roles: any;
  phoneNumber?: string;
  avatar?: string;
  // legacy fields kept so user-list.component references don't crash at runtime
  fname?: string;
  lname?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthenticatoonResponse {
  userId: number;
  jwt: string;
  fullName: string;
  userRole: UserRole;
}

export interface SignUpDTO {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface ForgotPasswordRequest {
  email: string;
  method?: string;
}

export interface ResetPasswordRequest {
  [x: string]: string | number | boolean;
  identifier: string;
  otp: string;
  newPassword: string;
}