export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
