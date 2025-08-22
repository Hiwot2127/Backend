# Backend Task Manager API

A TypeScript/Node.js backend for managing tasks with user authentication, role-based access control (RBAC), and file uploads. Built with Express, Prisma, and PostgreSQL.

---

## Features

- **User Registration & Login** (JWT authentication)
- **Role-based Authorization** (`USER` and `ADMIN`)
- **Task CRUD** (Create, Read, Update, Delete)
- **Task Ownership** (users only see/manage their own tasks)
- **Admin Controls** (promote users, view all tasks)
- **File Uploads** (attach files to tasks)
- **Unit & Integration Tests** (Vitest + Supertest)
- **Docker Support** (run app and database in containers)
- **Code Coverage** (see `coverage/` folder for reports)

---

## Project Structure

```
application/      # Use cases (business logic)
domain/           # Core types and repository interfaces
infrastructure/   # Prisma, security, storage implementations
interface/        # HTTP controllers and routes
middleware/       # Express middleware (auth, RBAC)
prisma/           # Prisma schema and migrations
uploads/          # Uploaded files (served statically)
tests/            # Unit and integration tests
coverage/         # Code coverage reports
app.ts            # Express app setup
server.ts         # App entrypoint
Dockerfile        # Docker image build instructions
docker-compose.yml# Multi-service orchestration
package.json      # NPM scripts and dependencies
.env              # Environment variables
```

---

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Set up environment

Copy `.env.example` to `.env` and fill in your database connection and JWT secret.

```
DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Run migrations & generate Prisma client

```sh
npx prisma migrate dev
npx prisma generate
```

### 4. Start the server

```sh
npm run dev
```
or
```sh
npm run build
npm start
```

### 5. Run with Docker

```sh
docker compose up --build
```
- This will start both the backend and a Postgres database in containers.

---

## API Usage

- **Register:** `POST /auth/register` `{ email, password }`
- **Login:** `POST /auth/login` `{ email, password }`
- **Promote User:** `POST /auth/promote/:id` (ADMIN only)
- **Create Task:** `POST /todos` `{ title, description }`
- **List Tasks:** `GET /todos` (USER: own, ADMIN: all with `?all=1`)
- **Get Task:** `GET /todos/:id`
- **Update Task:** `PUT /todos/:id`
- **Delete Task:** `DELETE /todos/:id`
- **Upload File:** `POST /todos/:id/upload` (form-data, key: `file`)
- **Serve Files:** `GET /uploads/:filename`

---

## Testing

- **Unit tests:**  
  ```sh
  npm run test
  ```
  - Tests isolated logic with mocked dependencies.

- **Integration tests:**  
  Configure `.env.test` for a test database, then run:
  ```sh
  npm run test:e2e
  ```
  - Tests API endpoints and real DB interactions.

- **Code coverage:**  
  After running tests, open `coverage/index.html` in your browser.

---

## Development Notes

- **RBAC:** Only admins can promote users or view all tasks.
- **Ownership:** Users can only update/delete their own tasks.
- **Uploads:** Files are saved in `uploads/` and served statically.
- **Prisma:** See [`prisma/schema.prisma`](prisma/schema.prisma) for DB structure.
- **Docker:** Use `docker-compose.yml` for local development and testing.

---