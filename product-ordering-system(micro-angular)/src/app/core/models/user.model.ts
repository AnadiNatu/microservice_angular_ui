export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
