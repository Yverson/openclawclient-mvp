import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { createUser, getUserByEmail } from './database.js';
import { User, JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export async function registerUser(email: string, password: string): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  return await createUser({
    email,
    password: hashedPassword
  });
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcryptjs.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  const { password: _, ...userWithoutPassword } = user;
  return {
    token,
    user: userWithoutPassword
  };
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function createToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}
