export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface StatusResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
}

export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
