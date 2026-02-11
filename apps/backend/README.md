# OpenClaw Client Backend

Node.js Express API backend for OpenClaw Client desktop application.

## Features

- ✅ JWT authentication
- ✅ SQLite database
- ✅ WebSocket support (chat)
- ✅ CORS enabled
- ✅ Mock API endpoints
- ✅ TypeScript

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run in dev mode
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

### Docker

```bash
# Build image
docker build -t openclawclient-backend:latest .

# Run container
docker run -p 18789:18789 openclawclient-backend:latest

# Using docker-compose
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user (requires auth)

### API
- `GET /api/status` - Server status
- `GET /api/emails` - Get mock emails
- `GET /api/files` - Get mock files
- `GET /api/dashboard` - Get dashboard data

### WebSocket
- `WS /ws?token=<jwt>` - Chat WebSocket

### Health
- `GET /health` - Health check
- `GET /` - API info

## Environment Variables

See `.env.example` for all available options:
- `PORT` - Server port (default: 18789)
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGINS` - Allowed CORS origins
- `NODE_ENV` - Environment (development/production)
- `DB_PATH` - SQLite database path

## Authentication

All protected endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Example Usage

### Login
```bash
curl -X POST http://localhost:18789/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Get Emails
```bash
curl http://localhost:18789/api/emails \
  -H "Authorization: Bearer <token>"
```

### WebSocket Chat
```javascript
const ws = new WebSocket('ws://localhost:18789/ws?token=<jwt>');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'message', content: 'Hello' }));
```

## Development

```bash
# Run tests
npm test

# Build TypeScript
npm run build

# Run in dev mode with hot reload
npm run dev
```

## License

MIT
