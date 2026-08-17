# 🚀 Prompt: Build Python (FastAPI) Authentication API for Sapphire Frontend

> **Usage:** Copy and paste the prompt below into ChatGPT, Claude, Cursor, Copilot, or any AI coding assistant to generate or implement the Python backend authentication service.

---

```markdown
You are an expert Python Backend Engineer. Your task is to build a secure, production-ready Authentication REST API using **FastAPI**, **Pydantic (v2)**, **PyJWT**, and **Passlib / Bcrypt / Argon2** (or your preferred secure hashing library).

This backend will serve as the upstream API for a Next.js (BFF) frontend application.

---

### 1. API Requirements & Route Specifications

All endpoints should be prefixed with `/auth` (or `/api/v1/auth` depending on `NEXT_PUBLIC_API_BASE_URL`).

#### Endpoints Summary:
1. `POST /auth/login` — Authenticate user and issue tokens
2. `POST /auth/refresh` — Issue a new access token using a valid refresh token
3. `GET /auth/me` — Return the authenticated user profile
4. `POST /auth/logout` — Revoke / invalidate the refresh token (optional / best-effort)

---

### 2. Detailed Endpoint Contracts

#### 🔹 1. Login Endpoint
- **Method:** `POST`
- **Path:** `/auth/login`
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "plain_password_string"
  }
  ```
- **Success Response (`200 OK`):**
  > **IMPORTANT:** Note camelCase field names (`accessToken`, `refreshToken`, `createdAt`, `updatedAt`) to match frontend expectations.
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_123456",
      "name": "Admin User",
      "email": "user@example.com",
      "role": "admin",
      "createdAt": "2026-08-16T09:14:28.000Z",
      "updatedAt": "2026-08-16T09:14:28.000Z"
    }
  }
  ```
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "message": "Invalid email or password"
  }
  ```

---

#### 🔹 2. Token Refresh Endpoint
- **Method:** `POST`
- **Path:** `/auth/refresh`
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "message": "Invalid or expired refresh token"
  }
  ```

---

#### 🔹 3. Current User Endpoint (`/me`)
- **Method:** `GET`
- **Path:** `/auth/me`
- **Request Headers:** `Authorization: Bearer <accessToken>`
- **Success Response (`200 OK`):**
  ```json
  {
    "id": "usr_123456",
    "name": "Admin User",
    "email": "user@example.com",
    "role": "admin",
    "createdAt": "2026-08-16T09:14:28.000Z",
    "updatedAt": "2026-08-16T09:14:28.000Z"
  }
  ```
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "message": "Invalid, expired, or missing authentication token"
  }
  ```

---

#### 🔹 4. Logout Endpoint
- **Method:** `POST`
- **Path:** `/auth/logout`
- **Request Headers:** `Authorization: Bearer <accessToken>` *(optional)*
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### 3. Data Models & Token Specifications

1. **User Roles:** Allowed role values are `"admin"`, `"user"`, or `"manager"`.
2. **Access Token:**
   - Expiration: **15 minutes**
   - Payload claims: `sub` (User ID), `email`, `role`, `exp`, `iat`, `type: "access"`
3. **Refresh Token:**
   - Expiration: **7 days**
   - Payload claims: `sub` (User ID), `exp`, `iat`, `type: "refresh"`
4. **Dates:** Format `createdAt` and `updatedAt` as ISO-8601 strings (e.g., `datetime.utcnow().isoformat() + "Z"`).
5. **CamelCase Serialization:** Ensure Pydantic model serialization uses `camelCase` aliases (`accessToken`, `refreshToken`, `createdAt`, `updatedAt`).

---

### 4. Implementation Requirements

Please provide:
1. **Requirements list / `requirements.txt`** (`fastapi`, `uvicorn`, `pyjwt` or `python-jose`, `passlib[bcrypt]`, `pydantic`, `python-dotenv`).
2. **Pydantic Schemas** (`LoginRequest`, `LoginResponse`, `RefreshTokenRequest`, `RefreshTokenResponse`, `UserResponse`).
3. **Security & JWT Helpers** (`create_access_token`, `create_refresh_token`, `verify_token`, `hash_password`, `verify_password`).
4. **Dependency Injection for Auth** (`get_current_user` using FastAPI `HTTPBearer` / `OAuth2PasswordBearer`).
5. **CORS Middleware Configuration** allowing requests from `http://localhost:3000` (Next.js frontend).
6. **In-memory demo storage or SQLAlchemy model setup** with a seed user (`admin@sapphire.com` / `12345` or hashed equivalent) to allow immediate testing.
```
