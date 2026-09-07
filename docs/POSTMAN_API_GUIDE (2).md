# 🚀 Complete Postman API Documentation & Testing Guide

This guide provides end-to-end endpoint specifications, headers, request parameters, sample request bodies, and exact JSON responses for testing the **Authentication API** and **Collections API** in Postman.

**Base URL:** `http://localhost:8000`

---

## 🔐 1. Authentication Endpoints

### 1️⃣ User Login
* **Method:** `POST`
* **URL:** `http://localhost:8000/auth/login` *(or `http://localhost:8000/api/v1/auth/login`)*
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "email": "admin@sapphire.com",
    "password": "12345"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1",
      "username": "admin",
      "email": "admin@sapphire.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "createdAt": "2026-08-16T09:14:28.000Z",
      "updatedAt": "2026-08-16T09:14:28.000Z"
    }
  }
  ```

---

### 2️⃣ Refresh Token
* **Method:** `POST`
* **URL:** `http://localhost:8000/auth/refresh` *(or `http://localhost:8000/api/v1/auth/refresh`)*
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 3️⃣ Get Authenticated User Profile (`/me`)
* **Method:** `GET`
* **URL:** `http://localhost:8000/auth/me` *(or `http://localhost:8000/api/v1/auth/me`)*
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
* **Success Response (`200 OK`):**
  ```json
  {
    "user": {
      "id": "usr_1",
      "username": "admin",
      "email": "admin@sapphire.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "createdAt": "2026-08-16T09:14:28.000Z",
      "updatedAt": "2026-08-16T09:14:28.000Z"
    }
  }
  ```

---

### 4️⃣ Register New User
* **Method:** `POST`
* **URL:** `http://localhost:8000/api/v1/auth/register/`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "username": "seller_john",
    "email": "seller@sapphire.com",
    "password": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "id": "usr_2",
    "username": "seller_john",
    "email": "seller@sapphire.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2026-08-21T21:00:00.000Z",
    "updatedAt": "2026-08-21T21:00:00.000Z"
  }
  ```

---

### 5️⃣ Logout
* **Method:** `POST`
* **URL:** `http://localhost:8000/auth/logout` *(or `http://localhost:8000/api/v1/auth/logout`)*
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
* **Body (raw JSON):**
  ```json
  {
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "message": "Successfully logged out"
  }
  ```

---

### 6️⃣ Get Full User List (Paginated & Filtered)
* **Method:** `GET`
* **URL:** `http://localhost:8000/api/v1/users`
* **Query Parameters (Optional):**
  * `page` *(default: 1)*
  * `limit` *(options: 10, 25, 50, default: 10)*
  * `role`: `admin` | `manager` | `user` (or comma separated e.g. `user,manager`)
  * `status`: `active` | `suspended`
  * `search`: `john` or `admin@sapphire.com`
* **Headers:** Optional / None
* **Success Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": "usr_1",
        "first_name": "Admin",
        "last_name": "User",
        "email": "admin@sapphire.com",
        "role": "admin",
        "status": "active",
        "createdAt": "2026-08-16T09:14:28.000Z"
      },
      {
        "id": "usr_2",
        "first_name": "John",
        "last_name": "Doe",
        "email": "seller@sapphire.com",
        "role": "user",
        "status": "active",
        "createdAt": "2026-08-21T21:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
  ```

---

## 👤 2. Seller Autocomplete Endpoint

* **Method:** `GET`
* **URL:** `http://localhost:8000/api/users/sellers` *(or `http://localhost:8000/api/v1/users?role=user`)*
* **Headers:** Optional / None
* **Success Response (`200 OK`):**
  ```json
  [
    {
      "id": "usr_2",
      "first_name": "John",
      "last_name": "Doe",
      "email": "seller@sapphire.com"
    }
  ]
  ```

---

## 💎 3. Collections API Endpoints

### 1️⃣ List Collections (Paginated & Filtered)
* **Method:** `GET`
* **URL:** `http://localhost:8000/api/v1/collections`
* **Query Parameters (Optional):**
  * `page` *(integer >= 1, default: 1)*
  * `limit` *(options: 10, 25, 50, 100, default: 25)*
  * `collection_type` *(`single_stone`, `bulk_stones`, `jewellery`, `industrial_stones`)*
  * `status` *(`review`, `accepted`)*
  * `seller_id` *(e.g. `usr_2`)*
  * `created_by` *(staff user UUID, e.g. `usr_1`)*
  * `created_at_from` *(ISO date `YYYY-MM-DD`)*
  * `created_at_to` *(ISO date `YYYY-MM-DD`)*
  * `search` *(searches serial number, seller name, or certification number)*
  * `sort_by` *(`created_at`, `asking_price`, `collection_type`)*
  * `sort_order` *(`desc`, `asc`)*
* **Example URL:** `http://localhost:8000/api/v1/collections?status=review&collection_type=single_stone&page=1&limit=25`
* **Success Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": "bfa86720-379e-4e4b-a91d-40098f98c8ab",
        "serial_no": "COL-SNG-2026-001",
        "collection_type": "single_stone",
        "status": "review",
        "seller": {
          "id": "usr_2",
          "first_name": "John",
          "last_name": "Doe",
          "email": "seller@sapphire.com",
          "role": "user"
        },
        "created_by": {
          "id": "usr_1",
          "first_name": "Manager",
          "last_name": "User",
          "email": "manager@sapphire.com",
          "role": "manager"
        },
        "asking_price": "1500.00",
        "gemstone_type": "sapphire",
        "variety": "blue sapphire",
        "weight": "3.4500",
        "weight_unit": "ct",
        "images": [
          "media/collections/sapphire_sample.jpg"
        ],
        "created_at": "2026-08-21T21:30:00.000Z",
        "updated_at": "2026-08-21T21:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 25
  }
  ```

---

### 2️⃣ Get Single Collection Detail
* **Method:** `GET`
* **URL:** `http://localhost:8000/api/v1/collections/<COLLECTION_UUID>`
* **Success Response (`200 OK`):** Returns the full collection object.

---

### 3️⃣ Create Collection (`single_stone`)
* **Method:** `POST`
* **URL:** `http://localhost:8000/api/v1/collections`
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>` *(Requires `admin` or `manager` role)*
* **Body:** `form-data` (multipart) *(Max file upload size: 100 MB per file)*

| Key | Value | Type |
| :--- | :--- | :--- |
| `collection_type` | `single_stone` | Text |
| `seller_id` | `usr_2` | Text |
| `asking_price` | `1500.00` | Text |
| `gemstone_type` | `Sapphire` | Text |
| `variety` | `Blue Sapphire` | Text |
| `treatment` | `Unheated` | Text |
| `origin` | `Sri Lanka` | Text |
| `weight` | `3.45` | Text |
| `weight_unit` | `ct` | Text |
| `shape` | `Cushion` | Text |
| `cut` | `Step Cut` | Text |
| `color` | `Royal Blue` | Text |
| `clarity` | `VVS1` | Text |
| `images` | *(Select image file - max 100 MB)* | File |
| `certificate` | *(Select PDF or Image file - max 100 MB)* | File (Optional) |

* **Success Response (`201 Created`):**
  ```json
  {
    "id": "bfa86720-379e-4e4b-a91d-40098f98c8ab",
    "serial_no": "COL-SNG-2026-001",
    "collection_type": "single_stone",
    "status": "review",
    "seller": {
      "id": "usr_2",
      "first_name": "John",
      "last_name": "Doe",
      "email": "seller@sapphire.com",
      "role": "user"
    },
    "created_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "updated_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "approved_by": null,
    "approved_at": null,
    "asking_price": "1500.00",
    "finalized_price": null,
    "payment_method": null,
    "certificate_url": "media/certificates/4a8c9b1d-2e3f.pdf",
    "barcode_url": null,
    "voucher_url": null,
    "images": [
      "media/collections/sapphire_sample.jpg"
    ],
    "gemstone_type": "sapphire",
    "variety": "blue sapphire",
    "weight": "3.4500",
    "weight_unit": "ct",
    "created_at": "2026-08-21T21:30:00.000Z",
    "updated_at": "2026-08-21T21:30:00.000Z"
  }
  ```

---

### 4️⃣ Create Collection (`bulk_stones`)
* **Method:** `POST`
* **URL:** `http://localhost:8000/api/v1/collections`
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>` *(Requires `admin` or `manager` role)*
* **Body:** `form-data` (multipart) *(Max file upload size: 100 MB per file)*

| Key | Value | Type |
| :--- | :--- | :--- |
| `collection_type` | `bulk_stones` | Text |
| `seller_id` | `usr_2` | Text |
| `asking_price` | `5000.00` | Text |
| `stones` | `[{"gemstone_type":"Ruby","variety":"Pigeon Blood","quantity":10,"weight":15.5,"weight_unit":"ct","price":3500.00},{"gemstone_type":"Emerald","variety":"Colombian","quantity":5,"weight":8.2,"weight_unit":"ct","price":1500.00}]` | Text |
| `description` | `High quality mixed gemstone parcel` | Text |

* **Success Response (`201 Created`):**
  ```json
  {
    "id": "a123bc45-678d-90ef-1234-56789abcdef0",
    "serial_no": "COL-BLK-2026-001",
    "collection_type": "bulk_stones",
    "status": "review",
    "seller": {
      "id": "usr_2",
      "first_name": "John",
      "last_name": "Doe",
      "email": "seller@sapphire.com",
      "role": "user"
    },
    "created_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "updated_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "approved_by": null,
    "approved_at": null,
    "asking_price": "5000.00",
    "finalized_price": null,
    "payment_method": null,
    "barcode_url": null,
    "voucher_url": null,
    "images": [],
    "stones": [
      {
        "gemstone_type": "ruby",
        "variety": "pigeon blood",
        "quantity": 10,
        "weight": 15.5,
        "weight_unit": "ct",
        "price": 3500.00
      },
      {
        "gemstone_type": "emerald",
        "variety": "colombian",
        "quantity": 5,
        "weight": 8.2,
        "weight_unit": "ct",
        "price": 1500.00
      }
    ],
    "description": "High quality mixed gemstone parcel",
    "created_at": "2026-08-21T21:32:00.000Z",
    "updated_at": "2026-08-21T21:32:00.000Z"
  }
  ```

---

### 5️⃣ Update Collection
* **Method:** `PUT`
* **URL:** `http://localhost:8000/api/v1/collections/<COLLECTION_UUID>`
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>` *(Requires `admin` or `manager` role)*
* **Body:** `form-data` (multipart) *(Max file upload size: 100 MB per file)*

| Key | Value | Type |
| :--- | :--- | :--- |
| `asking_price` | `1800.00` | Text |
| `color` | `vivid royal blue` | Text |
| `removed_image_urls` | `media/collections/sample_old.jpg` | Text (Optional) |
| `certificate` | *(Select new PDF/Image)* | File (Optional) |
| `remove_certificate` | `true` | Text (Optional) |

* **Success Response (`200 OK`):** Returns updated collection details. `serial_no` & `collection_type` remain immutable. Automatically records logged-in user in `updated_by`.

---

### 6️⃣ Delete Collection
* **Method:** `DELETE`
* **URL:** `http://localhost:8000/api/v1/collections/<COLLECTION_UUID>`
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>` *(Requires `admin` or `manager` role)*
* **Success Response (`204 No Content`)**

---

### 7️⃣ Accept Collection & Generate Payment Voucher (Review / Negotiation)
* **Method:** `PATCH`
* **URL:** `http://localhost:8000/api/v1/collections/<COLLECTION_UUID>/review`
* **Headers:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>` *(Requires `admin` or `manager` role)*
* **Body (raw JSON):**
  ```json
  {
    "finalized_price": 4200.00,
    "payment_method": "bank_transfer"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "id": "bfa86720-379e-4e4b-a91d-40098f98c8ab",
    "serial_no": "COL-SNG-2026-001",
    "status": "accepted",
    "asking_price": "4500.00",
    "finalized_price": "4200.00",
    "payment_method": "bank_transfer",
    "barcode_url": "media/barcodes/COL-SNG-2026-001.png",
    "voucher_url": "media/vouchers/COL-SNG-2026-001-payment-voucher.pdf",
    "seller": {
      "id": "usr_2",
      "first_name": "John",
      "last_name": "Doe",
      "email": "seller@sapphire.com",
      "role": "user"
    },
    "created_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "updated_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "approved_by": {
      "id": "usr_1",
      "first_name": "Manager",
      "last_name": "User",
      "email": "manager@sapphire.com",
      "role": "manager"
    },
    "approved_at": "2026-08-28T11:09:00.000Z"
  }
  ```
