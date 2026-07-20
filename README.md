# Price Comparison App

A full-stack web app that lets users browse and compare grocery product prices across stores, manage a personal grocery list, and track spending against a budget.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express |
| Product DB | MongoDB Atlas |
| Auth/Lists DB | PostgreSQL |
| Scraping | Python (Playwright) |

## Project Structure

```
Price-comparison/
├── backend/          # Express API
├── client/           # React frontend
└── scripts/          # Python scrapers
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL running locally
- MongoDB Atlas account

## Getting Started

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (or update the existing one):

```env
MONGODB_URI=your_mongodb_connection_string
DB_NAME=shopriteDB
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=pricecompare
PG_USER=postgres
PG_PASSWORD=your_pg_password

SCRAPER_API_KEY=your_scraper_api_key

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

```bash
npm run dev
```

Server runs on `http://localhost:3000`. Swagger docs available at `http://localhost:3000/api-docs` (dev only).

### 2. Frontend

```bash
cd client
npm install
```

Create a `client/.env` file:

```env
VITE_API_URL=/api
```

```bash
npm run dev
```

App runs on `http://localhost:5173`.

### 3. Scrapers

```bash
cd scripts
pip install -r requirements.txt
py -m playwright install chromium
py -m scrapers                                      # all stores
py -m scrapers --stores woolworths shoprite         # specific stores
```

> On some systems use `python` instead of `py`.

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | No | Invalidate refresh token |
| GET | `/auth/me` | Yes | Get current user |
| PATCH | `/auth/profile` | Yes | Update name/email |
| PATCH | `/auth/password` | Yes | Change password |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products/vegetables?page=1&limit=20` | No | Paginated vegetables |
| POST | `/insert-products` | API Key | Upsert products (insert or update by Shop Name + Product Name) |

### Grocery Lists
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/lists` | Yes | Create a list |
| GET | `/lists` | Yes | Get all user lists |
| GET | `/lists/:id` | Yes | Get a single list |
| PATCH | `/lists/:id/budget` | Yes | Update budget |
| DELETE | `/lists/:id` | Yes | Delete a list |
| POST | `/lists/:id/items` | Yes | Add item to list |
| PATCH | `/lists/:listId/items/:itemId` | Yes | Update item quantity |
| DELETE | `/lists/:listId/items/:itemId` | Yes | Remove item |

## Authentication Flow

- Login/register returns an `accessToken` (15m) and `refreshToken` (7d)
- The frontend automatically refreshes the access token on 401 responses
- Logout invalidates the refresh token in the database
- Expired refresh tokens are automatically purged from the database every hour
- Auth endpoints are rate limited to 10 requests per 15 minutes per IP

## Scraper → API Authentication

The `/insert-products` endpoint requires an `x-api-key` header. Set the same value in both `backend/.env` and `scripts/.env`:

```env
# backend/.env and scripts/.env
SCRAPER_API_KEY=your_long_random_secret
```

Generate a secure key with:

```bash
openssl rand -hex 32
```

## Product Deduplication

Products are uniquely identified by `Shop Name` + `Product Name`. On each scraper run:
- The scraper deduplicates the batch before sending
- The backend upserts into MongoDB — inserting new products and updating the price/image of existing ones
- No duplicate documents are ever created

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `DB_NAME` | No | MongoDB database name (default: `shopriteDB`) |
| `PORT` | No | Server port (default: `3000`) |
| `CORS_ORIGIN` | No | Allowed origin (default: `*`) |
| `SCRAPER_API_KEY` | Yes (prod) | Shared secret for scraper → API authentication |
| `JWT_SECRET` | Yes (prod) | Access token signing secret |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: `15m`) |
| `REFRESH_TOKEN_SECRET` | Yes (prod) | Refresh token signing secret |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh token expiry (default: `7d`) |
| `PG_HOST` | No | Postgres host (default: `localhost`) |
| `PG_PORT` | No | Postgres port (default: `5432`) |
| `PG_DATABASE` | No | Postgres database (default: `pricecompare`) |
| `PG_USER` | No | Postgres user (default: `postgres`) |
| `PG_PASSWORD` | No | Postgres password |
| `EMAIL_USER` | No | Gmail address for notifications |
| `EMAIL_PASS` | No | Gmail app password |
