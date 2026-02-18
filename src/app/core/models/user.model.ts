export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
