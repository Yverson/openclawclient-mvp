import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { User } from '../types/index.js';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const dbPath = process.env.DB_PATH || './data/openclaw.db';
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const database = await getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const result = await database.run(
    'INSERT INTO users (id, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    [id, user.email, user.password, now, now]
  );

  return {
    id,
    email: user.email,
    password: user.password,
    createdAt: now,
    updatedAt: now
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const database = await getDatabase();
  return await database.get<User>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const database = await getDatabase();
  return await database.get<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  ) || null;
}
