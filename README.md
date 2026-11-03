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

## Start the local MongoDB server

MongoDB Community 8.0.34 is installed locally on this development machine from MongoDB's official macOS Intel archive. Start and stop it with:

```sh
npm run db:start:local
npm run db:stop:local
```

The database files are stored under `~/.local/var/mongodb`, outside the project. The helper scripts bind MongoDB to localhost only. On another computer, install MongoDB Community Server separately or use an Atlas URI in `MONGODB_URI`.

## Connect MongoDB Compass

The local MongoDB Community server listens on `127.0.0.1:27017`. In Compass, create a connection using:

```text
mongodb://127.0.0.1:27017/econly
```

The database and collections appear after the app writes its first documents. The dev seed command below inserts one local test user and product.

## Current endpoints and limitations

- `POST /api/v1/auth/register` creates a user with a bcrypt-hashed password. It requires `fullName`, `email`, and a password of at least eight characters. Email addresses are normalized to lowercase, and an existing email returns `409 EMAIL_ALREADY_REGISTERED`. Registration does not sign the user in; call login after it succeeds.
- `POST /api/v1/auth/login` checks a stored user's bcrypt password and creates server-managed access and refresh sessions.
- `POST /api/v1/auth/logout` revokes the current session.
- `GET /api/v1/products/:id` reads from Redis when enabled and available, otherwise from MongoDB. Product cache entries expire after five minutes.
- `GET /api/v1/cart` returns the authenticated user's cart. Cart write operations are not implemented yet.

## Test with Postman

Import `postman/ecomly-api.postman_collection.json` and `postman/local.postman_environment.json` into Postman, select the `Ecomly Local` environment, start MongoDB, seed local fixtures, and then start the API:

```sh
npm run db:start:local
npm run seed:dev
npm run dev
```

Open the collection's Runner and run `Ecomly Local API` in order. Its requests cover health, registration, duplicate-email rejection, login, authenticated cart access, product lookup, invalid product IDs, logout, and rejection of a revoked token. Registration uses a newly generated email on each run, so it can be repeated. The seeded credentials are development-only. The product cache uses Redis only when Redis is running and `REDIS_ENABLED=true`; otherwise product requests use MongoDB directly.

Access and refresh tokens are generated randomly. Only their SHA-256 hashes are stored in MongoDB. Access tokens expire after 15 minutes and refresh tokens after 30 days. A refresh endpoint and token rotation still need implementation.

`.env` is ignored by Git. Use `.env.example` as the local configuration template; do not commit credentials.
