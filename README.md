# ExpiryGuard

ExpiryGuard is an inventory and expiry-tracking system for pharmacies and medicine stores. It tracks stock **by batch**, warns before batches expire, and blocks the sale of expired medicine.

## Features

- **Batch-level stock tracking**: every purchase creates a batch with its own batch number, quantity, manufacturing date, expiry date and unit price.
- **Stock movements**: record `RECEIVED`, `SOLD` and `DISPOSED` events. Each change locks the batch row, so concurrent updates can't corrupt the count.
- **Expiry protection**: selling an expired batch is rejected (HTTP 409).
- **Alerts**: expired, critical and expiring-soon batches, plus low-stock warnings based on each product's reorder level.
- **Barcode lookup**: scan a product with the camera or type its barcode or SKU.
- **Dashboard and reports**: summary statistics, plus CSV exports for inventory, disposals and expiry.
- **Role-based access**: admins manage users, reports and settings. Pharmacists handle inventory day to day.
- **Self-registration with approval**: new accounts need admin approval unless `EXPIRYGUARD_AUTO_APPROVE=true`.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Spring Boot 4.1, Java 25, Spring Security, Spring Data JPA, Bean Validation |
| Database | PostgreSQL 17 |
| Containers | Docker, Docker Compose, nginx |

## Architecture

```
Browser ──► client (nginx, port 8080)
              ├── /        → React single-page app
              └── /api/*   → server (Spring Boot, port 9090)
                                  │
                              db (PostgreSQL 17, port 5432)
```

Only the client is exposed to the outside. The server and database are reachable only inside the Docker network.

## Project structure

```
ExpiryGuard/
├── client/          React frontend (Vite) and nginx config
├── server/          Spring Boot backend (Maven)
│   └── src/main/java/com/expiryguard/server/
│       ├── config/       security, bootstrap admin, seed data
│       ├── controller/   REST endpoints
│       ├── entity/       JPA entities (Batch, Product, StockMovement, ...)
│       ├── repository/   Spring Data repositories
│       ├── service/      business rules (stock movements, inventory creation)
│       └── exception/    API error handling
├── compose.yaml     Docker Compose: db, server, client
└── .env             local secrets (not committed)
```

## Getting started

### Prerequisites

- Docker Desktop
- Node.js 22 or later (for local frontend development)
- JDK 25 (for local backend development)

### 1. Configure secrets

Create `.env` in the project root. Do not commit it.

```
DB_PASSWORD=choose-a-strong-password
```

### 2. Run everything with Docker

```
docker compose up --build
```

Open `http://localhost:8080`.

### 3. Create the first admin

On the first run only, add these variables to the `server` service in `compose.yaml` (or your IDE run configuration), then remove them after the admin is created:

```
EXPIRYGUARD_BOOTSTRAP_USERNAME=admin
EXPIRYGUARD_BOOTSTRAP_EMAIL=admin@example.com
EXPIRYGUARD_BOOTSTRAP_PASSWORD=a-strong-password
```

The bootstrap runs only when the users table is empty. Its password must be 8 to 72 bytes.

## Local development

Run the database in Docker and the code on your machine. Edits show up quickly and you don't rebuild images.

**1. Start the database** (with `ports: - "5432:5432"` under `db` in `compose.yaml`):

```
docker compose up -d db
```

**2. Start the backend** from `server/`, with these environment variables set (or in your IDE run configuration):

```
DB_URL=jdbc:postgresql://localhost:5432/expiryguard
DB_USERNAME=expiryguard
DB_PASSWORD=<same value as in .env>
```

```
./mvnw spring-boot:run        (Windows: mvnw.cmd spring-boot:run)
```

**3. Start the frontend** from `client/`:

```
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server should proxy `/api` to `http://localhost:9090`.

## Testing

```
cd server
./mvnw test
```

The integration test starts a temporary PostgreSQL 17 container with Testcontainers, so **Docker must be running**.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/expiryguard` | JDBC connection string |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | none (required) | Database password |
| `COOKIE_SECURE` | `false` | Set `true` when serving over HTTPS |
| `EXPIRYGUARD_AUTO_APPROVE` | `false` | Approve self-registered accounts automatically |
| `EXPIRYGUARD_BOOTSTRAP_USERNAME` / `_EMAIL` / `_PASSWORD` | unset | Create the first admin (first run only) |

Expiry thresholds (expiring soon, critical) and the low-stock default are managed in the Settings page and stored in the database.

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/csrf` |
| Users | `/api/admin/users` (admin) |
| Products | `/api/products`, `/api/products/lookup` |
| Inventory | `/api/inventory` (read and create) |
| Batches | `/api/batches` |
| Stock movements | `/api/stock-movements` |
| Purchases | `/api/purchases` |
| Categories and suppliers | `/api/categories`, `/api/suppliers` |
| Alerts | `/api/alerts` |
| Dashboard | `/api/dashboard/stats` |
| Reports (admin) | `/api/reports/inventory.csv`, `/api/reports/disposals.csv`, `/api/reports/expiry.csv` |
| Settings (admin) | `/api/settings` |

All changes require a session login and a CSRF token. Read endpoints are available to all logged-in users.

## Security notes

- Session-based login with an HttpOnly, SameSite=Lax cookie and a 30-minute timeout.
- CSRF protection on all state-changing requests.
- Passwords hashed with BCrypt (strength 12).
- Error details are hidden from API responses.
- No default accounts. The first admin is created only from environment variables.

**Before production:**
- Serve over HTTPS and set `COOKIE_SECURE=true`.
- Use Docker or platform secrets instead of `.env`.
- Replace `spring.jpa.hibernate.ddl-auto=update` with versioned migrations (Flyway or Liquibase).
- Run the containers as a non-root user.

Add a license before publishing.
