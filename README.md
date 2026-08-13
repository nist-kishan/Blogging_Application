# Blog Platform

A full-stack blogging platform with a Spring Boot backend, React frontend, PostgreSQL persistence, JWT cookie authentication, image uploads, comments, likes, bookmarks, categories, and an admin dashboard.

## Features

- Public blog feed with pagination, sorting, category filters, author filters, featured posts, search, and trending posts
- User registration, login, logout, email verification, password reset, and password change
- HttpOnly cookie-based access and refresh token flow
- Create, edit, publish, draft, and delete blog posts
- Comments with authenticated create/update/delete access
- Likes and bookmarks for authenticated users
- Category management
- Admin dashboard for users, blogs, comments, and categories
- Cloudinary image uploads with local upload fallback
- PostgreSQL schema management through Flyway
- Dockerized backend and PostgreSQL setup
- Render deployment blueprint and Vercel SPA routing support

## Tech Stack

### Backend

- Java 24
- Spring Boot 4
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- JWT
- MapStruct
- Lombok
- Cloudinary
- Maven

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Lucide React
- Oxlint

## Project Structure

```text
.
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/blogplatform/
│   │   ├── config/             # Security, CORS, database, Cloudinary, web config
│   │   ├── controller/         # REST API controllers
│   │   ├── dto/                # Request and response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── exception/          # Global exception handling
│   │   ├── mapper/             # MapStruct mappers
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # JWT and user principal logic
│   │   ├── service/            # Business logic
│   │   └── util/               # Shared utility classes
│   └── src/main/resources/
│       ├── application.yml
│       ├── application-prod.yml
│       └── db/migration/       # Flyway migrations
├── frontend/                   # React/Vite app
│   ├── src/api/                # Axios and React Query setup
│   ├── src/components/         # Shared UI components
│   ├── src/layouts/            # Page layouts
│   ├── src/pages/              # Route pages
│   ├── src/routes/             # Protected/admin route guards
│   ├── src/services/           # API client modules
│   ├── src/store/              # Redux store
│   └── src/validations/        # Zod schemas
├── docker-compose.yml          # PostgreSQL and backend services
├── render.yaml                 # Render deployment blueprint
└── blog_platform_postman_collection.json
```

## Prerequisites

- Java 24
- Maven
- Node.js and npm
- Docker Desktop, optional but recommended for PostgreSQL
- PostgreSQL 16, if not using Docker
- Cloudinary account, optional for production image uploads
- SMTP credentials, optional for email verification and password reset

## Quick Start

### 1. Start PostgreSQL and the backend with Docker

From the repository root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL at `localhost:5432`
- Backend API at `http://localhost:8085`

Check the backend:

```bash
curl http://localhost:8085/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "blog-platform"
}
```

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The frontend defaults to `http://localhost:8085` for the API, which matches the Docker Compose backend port.

## Running Without Docker

Start PostgreSQL locally and create a database named `blog_db`, then run:

```bash
cd backend
mvn spring-boot:run
```

By default, the backend uses:

```text
DATABASE_URL=jdbc:postgresql://localhost:5432/blog_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=root
PORT=8080
```

If you run the backend directly on port `8080`, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8080` | Backend HTTP port |
| `SPRING_PROFILES_ACTIVE` | `dev` | Spring profile, use `prod` in production |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/blog_db` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | `postgres` | Database username |
| `DATABASE_PASSWORD` | `root` | Database password |
| `JWT_SECRET` | Development secret | Secret for JWT signing, use a strong production value |
| `COOKIE_SECURE` | `false` | Set to `true` for HTTPS deployments |
| `COOKIE_SAME_SITE` | `Lax` | Use `None` for cross-site deployed frontend/backend |
| `FRONTEND_URL` | `http://localhost:5173` | Used in verification and reset email links |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USERNAME` | empty | SMTP username |
| `SMTP_PASSWORD` | empty | SMTP password |
| `CLOUDINARY_CLOUD_NAME` | empty | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | empty | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | empty | Cloudinary API secret |

### Frontend

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8085` | Backend API base URL |

## Database

Flyway runs migrations from:

```text
backend/src/main/resources/db/migration
```

The initial migration creates:

- `users`
- `refresh_tokens`
- `categories`
- `blogs`
- `comments`
- `likes`
- `bookmarks`

It also seeds:

- Admin user: `admin@blogplatform.com`
- Admin username: `admin`
- Admin password: `AdminPassword123!`
- Default category: `Technology`

Change the seeded admin password before using this in a real deployment.

## API Overview

All normal API endpoints are under:

```text
/api/v1
```

The health check is available at:

```text
GET /health
```

Responses use this shape:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {},
  "timestamp": "2026-08-14T00:00:00Z"
}
```

### Authentication

Authentication uses HttpOnly cookies:

- `accessToken`
- `refreshToken`

The frontend sends cookies with requests using Axios `withCredentials: true`. When a request returns `401`, the frontend attempts `POST /api/v1/auth/refresh` and retries the original request.

### Public Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Log in |
| `POST` | `/api/v1/auth/logout` | Log out |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET` | `/api/v1/auth/verify-email?token=...` | Verify email address |
| `POST` | `/api/v1/auth/forgot-password` | Send password reset email |
| `POST` | `/api/v1/auth/reset-password` | Reset password |
| `GET` | `/api/v1/blogs` | List published blogs for anonymous users |
| `GET` | `/api/v1/blogs/{slug}` | Get blog by slug |
| `GET` | `/api/v1/blogs/id/{id}` | Get blog by ID |
| `GET` | `/api/v1/blogs/search?query=...` | Search blogs |
| `GET` | `/api/v1/blogs/trending` | Get trending blogs |
| `POST` | `/api/v1/blogs/{id}/view` | Increment view count |
| `GET` | `/api/v1/categories` | List categories |
| `GET` | `/api/v1/categories/{slug}` | Get category by slug |
| `GET` | `/api/v1/comments/blog/{blogId}` | List comments for a blog |
| `GET` | `/api/v1/users/{username}` | View public user profile |
| `GET` | `/uploads/**` | Serve locally uploaded files |

### Authenticated Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/auth/me` | Get current user |
| `POST` | `/api/v1/auth/change-password` | Change password |
| `PUT` | `/api/v1/users/profile` | Update profile |
| `POST` | `/api/v1/blogs` | Create blog |
| `PUT` | `/api/v1/blogs/{id}` | Update own blog, or any blog as admin |
| `DELETE` | `/api/v1/blogs/{id}` | Delete own blog, or any blog as admin |
| `POST` | `/api/v1/blogs/{id}/like` | Like blog |
| `DELETE` | `/api/v1/blogs/{id}/like` | Unlike blog |
| `GET` | `/api/v1/blogs/liked` | List liked blogs |
| `POST` | `/api/v1/blogs/{id}/bookmark` | Bookmark blog |
| `DELETE` | `/api/v1/blogs/{id}/bookmark` | Remove bookmark |
| `GET` | `/api/v1/blogs/bookmarked` | List bookmarked blogs |
| `POST` | `/api/v1/comments/blog/{blogId}` | Add comment |
| `PUT` | `/api/v1/comments/{id}` | Update own comment |
| `DELETE` | `/api/v1/comments/{id}` | Delete own comment, or any comment as admin |
| `POST` | `/api/v1/categories` | Create category |
| `POST` | `/api/v1/upload` | Upload file |

### Admin Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/v1/admin/users` | List users |
| `PUT` | `/api/v1/admin/users/{id}/role?role=ADMIN` | Update user role |
| `DELETE` | `/api/v1/admin/users/{id}` | Delete user |
| `PUT` | `/api/v1/categories/{id}` | Update category |
| `DELETE` | `/api/v1/categories/{id}` | Delete category |

## Common Request Examples

### Register

```bash
curl -X POST http://localhost:8085/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reader@example.com",
    "username": "reader",
    "fullName": "Reader Example",
    "password": "Password123"
  }'
```

### Login

```bash
curl -i -c cookies.txt -X POST http://localhost:8085/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "AdminPassword123!"
  }'
```

### Create Blog

```bash
curl -X POST http://localhost:8085/api/v1/blogs \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "First Post",
    "summary": "A short summary",
    "content": "Post content",
    "bannerUrl": "",
    "categoryId": "c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "PUBLISHED",
    "featured": false
  }'
```

## Frontend Routes

| Path | Description |
| --- | --- |
| `/` | Home feed |
| `/login` | Login |
| `/register` | Register |
| `/verify-email` | Email verification |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/blog/:slug` | Blog detail |
| `/profile/:username` | Public profile |
| `/categories` | Category browsing |
| `/search` | Blog search |
| `/write` | Create blog, protected |
| `/edit/:id` | Edit blog, protected |
| `/bookmarks` | Bookmarked posts, protected |
| `/admin` | Admin dashboard, admin only |

## Development Commands

### Backend

```bash
cd backend
mvn test
mvn spring-boot:run
mvn clean package
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Deployment

### Render

The repository includes `render.yaml` for:

- PostgreSQL database named `blog-postgres-db`
- Docker-based backend service named `blog-backend-api`
- Static frontend service named `blog-frontend`

For production, set these values carefully:

- `FRONTEND_URL` to the deployed frontend URL
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=None` when frontend and backend are on different domains
- Cloudinary credentials if image uploads should use Cloudinary
- SMTP credentials if email flows should send real email

After deployment, verify:

```bash
curl https://your-backend.onrender.com/health
```

### Vercel

The frontend includes `vercel.json` with an SPA rewrite to `index.html`. Configure:

```env
VITE_API_URL=https://your-backend.onrender.com
```

## Postman

A Postman collection is included:

```text
blog_platform_postman_collection.json
```

Import it into Postman to exercise the backend endpoints.

## Notes

- Anonymous users can only see published blog posts.
- Authenticated users can create categories, while updating and deleting categories requires admin access.
- Local uploads are stored in the backend `uploads` directory and served from `/uploads/**`.
- Cloudinary is used automatically when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are configured.
- The backend exposes Swagger UI at `/swagger-ui.html` when the app is running.
