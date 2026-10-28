# Ecomly Backend

Node.js API starter using Express, MongoDB/Mongoose, bcrypt, and optional Redis caching.

## Setup

```sh
npm install
cp .env.example .env
```

Set `MONGODB_URI` to a reachable MongoDB instance. To enable Redis caching, start a Redis server and set `REDIS_ENABLED=true` and `REDIS_URL` in `.env`. Redis is an optional cache; MongoDB remains the source of truth. The npm `redis` package is installed, but it does not install or start the Redis server itself.

## Run

```sh
npm run dev
```

The API listens on port `3000` by default. `GET /health` checks that the process is serving requests. Product lookup is available at `GET /api/v1/products/:id`.

## Current endpoints and limitations

- `POST /api/v1/auth/login` checks a stored user's bcrypt password and creates server-managed access and refresh sessions. There is not yet a public registration flow or seed user.
- `POST /api/v1/auth/logout` revokes the current session.
- `GET /api/v1/products/:id` reads from Redis when enabled and available, otherwise from MongoDB. Product cache entries expire after five minutes.
- `GET /api/v1/cart` returns the authenticated user's cart. Cart write operations are not implemented yet.

Access and refresh tokens are generated randomly. Only their SHA-256 hashes are stored in MongoDB. Access tokens expire after 15 minutes and refresh tokens after 30 days. A refresh endpoint and token rotation still need implementation.

`.env` is ignored by Git. Use `.env.example` as the local configuration template; do not commit credentials.
