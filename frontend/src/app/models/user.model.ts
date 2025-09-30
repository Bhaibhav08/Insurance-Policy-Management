export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'agent';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  profilePhoto?: string;
}
