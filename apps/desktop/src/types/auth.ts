export type UserRole = "admin" | "user"

export interface User {
  id: string
  name: string
  email?: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginRequest {
  apiUrl: string
  token: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}
