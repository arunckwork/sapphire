# Users List API — Frontend Reference

> Derived from the frontend users listing feature in `src/features/users/`.

---

## List Users

Fetches a paginated, filtered, and sorted list of users.

### Request

```
GET /api/users
```

All calls pass through the Next.js BFF proxy, which forwards the `access_token` cookie as a `Bearer` token to the upstream API.

### Query Parameters

| Parameter    | Type                                              | Required | Default     | Description                                   |
|--------------|---------------------------------------------------|----------|-------------|-----------------------------------------------|
| `search`     | `string`                                          | No       | `""`        | Free-text search across name, email, and role |
| `sort_by`    | `"first_name" \| "email" \| "role" \| "createdAt"` | No       | `"createdAt"` | Field to sort by                           |
| `sort_order` | `"asc" \| "desc"`                                 | No       | `"desc"`    | Sort direction                                |
| `page`       | `number` (integer ≥ 1)                            | No       | `1`         | Page number (1-based)                         |
| `limit`      | `10 \| 25 \| 50`                                  | No       | `10`        | Number of users per page                      |

**Example:**

```
GET /api/users?search=john&sort_by=createdAt&sort_order=desc&page=1&limit=10
```

### Response

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "string",
      "first_name": "string",
      "last_name": "string | undefined",
      "email": "string",
      "role": "admin | manager | user",
      "status": "active | suspended",
      "createdAt": "ISO 8601 date string"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

### Response Fields

#### Top-level

| Field   | Type     | Description                             |
|---------|----------|-----------------------------------------|
| `data`  | `User[]` | Array of user objects for the current page |
| `total` | `number` | Total count of users matching the query |
| `page`  | `number` | Current page number (echoed back)       |
| `limit` | `number` | Page size (echoed back)                 |

#### `User` Object

| Field        | Type                              | Required | Description                           |
|--------------|-----------------------------------|----------|---------------------------------------|
| `id`         | `string`                          | Yes      | Unique user identifier                |
| `first_name` | `string`                          | Yes      | First name (used for avatar initial)  |
| `last_name`  | `string`                          | No       | Last name (optional)                  |
| `email`      | `string`                          | Yes      | Email address                         |
| `role`       | `"admin" \| "manager" \| "user"` | Yes      | User's role                           |
| `status`     | `"active" \| "suspended"`        | Yes      | Account status                        |
| `createdAt`  | `string` (ISO 8601)               | Yes      | Account creation timestamp            |

---

## Pagination Behaviour

The frontend computes `totalPages` as:

```
totalPages = Math.max(1, Math.ceil(total / limit))
```

The table toolbar exposes page sizes of **10**, **25**, and **50**. Changing the page size resets back to page `1`.

---

## Search Behaviour

- Search is debounced by **400 ms** on the frontend before a new request is fired.
- Searching resets `page` to `1`.
- The placeholder text is `"Search by name, email, role…"`, so the backend is expected to match against all three fields.

---

## Sort Behaviour

- Sortable columns: `first_name` (displayed as **Name**), `email`, `role`, `createdAt` (displayed as **Joined**).
- Clicking the same column twice toggles between `asc` and `desc`.
- Clicking a new column starts at `asc`.
- Any sort change resets `page` to `1`.

---

## Frontend Caching

The `getUsers` call is made with **`cacheFor: 0`** (no cache) via the Alova HTTP client, ensuring every navigation/filter change fetches fresh data from the server.

---

## Related Endpoints

| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| `GET`  | `/api/users`              | **List users** ← this document    |
| `POST` | `/api/users/register`     | Register a new user               |
| `PUT`  | `/api/users/:id`          | Update an existing user's details |
| `POST` | `/api/users/:id/suspend`  | Suspend an active user            |
| `POST` | `/api/users/:id/activate` | Reactivate a suspended user       |

---

## TypeScript Types (Frontend)

```ts
// src/features/users/types/user.types.ts

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role: Role;           // 'admin' | 'manager' | 'user'
  status: UserStatus;
  createdAt: string;
}

export type SortableUserField = 'first_name' | 'email' | 'role' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface UsersQueryParams {
  search: string;
  sort_by: SortableUserField;
  sort_order: SortOrder;
  page: number;
  limit: number;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
```

---

*Source files: [`user.service.ts`](../src/features/users/services/user.service.ts) · [`user.types.ts`](../src/features/users/types/user.types.ts) · [`useUsers.ts`](../src/features/users/hooks/useUsers.ts) · [`endpoints.ts`](../src/constants/endpoints.ts)*
