# Ecomly Backend

REST API for the Ecomly marketplace, built with Node.js, Express, MongoDB/Mongoose, and bcrypt. Redis is available as an optional product cache.

## Requirements

- Node.js 20 or newer
- A reachable MongoDB server (local MongoDB Community Server or MongoDB Atlas)
- Redis only if you want to enable the optional cache

## Install and configure

From this directory:

```sh
npm install
cp .env.example .env
```

Set the values in `.env` for the environment you are running:

| Variable | Purpose | Local development value |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment; the dev seeder requires `development` | `development` |
| `PORT` | HTTP port for Express | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/econly` |
| `REDIS_URL` | Redis connection string, used only when enabled | `redis://127.0.0.1:6379` |
| `REDIS_ENABLED` | Enable or disable the optional Redis cache | Set `false` unless Redis is running (`.env.example` currently has `true`) |

`.env` is ignored by Git. Keep database credentials and production connection strings out of committed files.

## MongoDB and Compass

Compass is the GUI client; it connects to a running MongoDB server. For a local server, connect Compass with:

```text
mongodb://127.0.0.1:27017/econly
```

This project includes helper commands for a local MongoDB installation:

```sh
npm run db:start:local
npm run db:stop:local
```

The helper binds MongoDB to localhost and stores data under `~/.local/var/mongodb`. If `db:start:local` reports `Address already in use`, MongoDB is already listening on port `27017`; connect to that instance in Compass and continue. Don’t launch another `mongod` on the same port. The script expects MongoDB at its configured local path; set `MONGOD_BIN` if your installation is elsewhere.

For MongoDB Atlas, use the URI from Atlas in `MONGODB_URI`. Configure an Atlas database user and allow the development machine’s IP in the project’s network access list. Compass and this API can use the same URI.

## Run the API

Start the server after MongoDB is available:

```sh
npm start
```

The API listens on port `3000` by default. A successful startup prints `Connected to MongoDB.` followed by `Ecomly API listening on port 3000.`

For automatic restart during development:

```sh
npm run dev
```

If Node’s file watcher hits a system file limit, use `npm start` while developing.

## API routes

All routes use JSON unless otherwise specified.

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | None | Check that the API process is responding |
| `POST` | `/api/v1/auth/register` | None | Create an account |
| `POST` | `/api/v1/auth/login` | None | Verify credentials and create a session |
| `POST` | `/api/v1/auth/logout` | Bearer access token | Revoke the current session |
| `GET` | `/api/v1/products/:id` | None | Get one active product by MongoDB ObjectId |
| `GET` | `/api/v1/cart` | Bearer access token | Get the signed-in user’s cart, or an empty cart |

### Register a user

`POST /api/v1/auth/register` requires `firstName`, `lastName`, `phoneNumber`, `dateOfBirth`, `email`, and `password`.

```json
{
  "firstName": "Ama",
  "lastName": "Mensah",
  "phoneNumber": "+233 24 123 4567",
  "dateOfBirth": "1995-05-20",
  "email": "ama@example.test",
  "password": "StrongPassword123!"
}
```

`dateOfBirth` must be a real date in `YYYY-MM-DD` format and cannot be in the future. Phone numbers must contain 7–15 digits, with an optional leading `+`; spaces, parentheses, periods, and hyphens are removed before storage. Email is trimmed and lowercased. Passwords must be at least eight characters and are stored as bcrypt hashes.

`confirmPassword` is not part of the API contract. The client should compare it with `password` before sending the request; it is never stored.

Success returns `201 Created`:

```json
{
  "user": {
    "_id": "...",
    "firstName": "Ama",
    "lastName": "Mensah",
    "fullName": "Ama Mensah",
    "phoneNumber": "+233241234567",
    "dateOfBirth": "1995-05-20",
    "email": "ama@example.test"
  }
}
```

The response does not include the password or password hash. An email already in use returns `409 EMAIL_ALREADY_REGISTERED`. Validation failures return `400` with a stable error code in `error.code`.

### Log in and use authenticated routes

Send this JSON to `POST /api/v1/auth/login`:

```json
{
  "email": "ama@example.test",
  "password": "StrongPassword123!"
}
```

Login returns access and refresh tokens and a user object. The API currently creates 15-minute access tokens and 30-day refresh tokens. Only token hashes are stored in MongoDB. Send the access token on protected routes as:

```text
Authorization: Bearer <accessToken>
```

`POST /api/v1/auth/logout` revokes the session associated with the access token. A refresh endpoint and token rotation are not implemented yet.

## Development seed data

Seed the local Postman user and sample product with:

```sh
npm run seed:dev
```

The script refuses to run unless `NODE_ENV=development` and `MONGODB_URI` points to localhost. It upserts fixtures, so it can be run again. The local test login is:

```text
Email: postman@example.test
Password: EcomlyLocal123!
Product ID: 64f000000000000000000001
```

These credentials are for local development only.

## Test with Postman

Import these files into Postman:

- `postman/ecomly-api.postman_collection.json`
- `postman/local.postman_environment.json`

Select the `Ecomly Local` environment. If MongoDB is not already running, start it with `npm run db:start:local`. Then seed fixtures and start the API in separate terminal sessions:

```sh
npm run seed:dev
npm start
```

Run `Ecomly Local API` with the Collection Runner in order. The collection checks health, registration with a generated email, duplicate-email rejection, invalid date rejection, seeded-user login, cart access, product lookup, invalid product IDs, logout, and rejection of a revoked token. The registration email is generated for each run and shared with the duplicate-email request through a collection variable.

If Postman times out, check that the API is listening on port `3000`, the request resolves to `http://127.0.0.1:3000`, and `Ecomly Local` is selected. When using the Postman web app, use the Desktop Agent; the Cloud Agent cannot reach a local `127.0.0.1` service. Re-import the collection JSON after it changes in this repository.

## Current scope and limitations

- Registration, login, logout, product read, and cart read are implemented.
- Cart writes, product management, orders, checkout, password recovery, email/OTP verification, refresh-token rotation, and social sign-in are not implemented.
- Redis is an optional product cache. MongoDB remains the source of truth. If Redis is disabled or unavailable, product reads continue from MongoDB.
- WebSockets are not implemented. The current API uses REST.
- The Flutter client is a separate project; configure its API base URL and remote auth datasource before connecting its UI to this API.
