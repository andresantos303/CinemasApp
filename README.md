# 🎬 Cinema App: REST API Routes Documentation

This document describes all **REST API endpoints** for the **"Cinema App"** system, organized by **Microservice** and its core functionality.

---

## 📝 List of Endpoints by Microservice

### 🧑‍💼 Users Service (Users & Auth)

Manages user **Authentication** and **Profile Management**.

#### 🔑 Authentication and Registration

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/auth/login` | Authenticate a user and obtain a **JWT**. | N/A | N/A | `{"email": "...", "password": "..."}` |
| **`POST`** | `/users` | Register a **new user** in the system. | N/A | N/A | `{"name": "...", "email": "...", "password": "..."}` |

#### ⚙️ Profile Management (CRUD)

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/users` | List **all** registered users. | N/A | `role` (Optional) | N/A |
| **`GET`** | `/users/:id` | Get a specific user's **profile**. | `:id` (User ID) | N/A | N/A |
| **`PUT`** | `/users/:id` | **Update** the user profile (name, email, role). | `:id` (User ID) | N/A | `{"name": "...", "email": "...", "role": "..."}` (Partial/Complete) |
| **`DELETE`** | `/users/:id` | **Delete** a user record. | `:id` (User ID) | N/A | N/A |

---

### 🎬 Movies Service (Movie Catalog)

Responsible for **Movie Management** and the main catalog.

#### 🎥 Movie Management (CRUD)

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/movies` | **List** the complete movie catalog. | N/A | `genre`, `year`, `limit` | N/A |
| **`POST`** | `/movies` | **Add** a new movie to the catalog. | N/A | N/A | `{"title": "...", "genre": "...", "year": ..., "duration": ...}` |
| **`GET`** | `/movies/:id` | Get the **details** of a specific movie. | `:id` (Movie ID) | N/A | N/A |
| **`PUT`** | `/movies/:id` | **Update** the movie metadata. | `:id` (Movie ID) | N/A | `{"title": "...", "genre": "..."}` (Partial/Complete) |
| **`DELETE`** | `/movies/:id` | **Remove** a movie from the catalog. | `:id` (Movie ID) | N/A | N/A |

---

### 📜 Playlists Service (Exhibition Lists)

Manages **Playlists** (exhibition lists) and their composition.

#### 🗒️ Playlist Management (CRUD)

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/playlists` | **List** all playlists. | N/A | `owner_id`, `status` | N/A |
| **`POST`** | `/playlists` | **Create** a new playlist. | N/A | N/A | `{"name": "...", "description": "...", "owner_id": "..."}` |
| **`GET`** | `/playlists/:id` | Get the detailed **structure** (items) of a playlist. | `:id` (Playlist ID) | N/A | N/A |
| **`DELETE`** | `/playlists/:id` | **Delete** a playlist. | `:id` (Playlist ID) | N/A | N/A |

#### ➕ Item Control

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/playlists/:id/items` | **Add** a movie or ad to the playlist. | `:id` (Playlist ID) | N/A | `{"type": "movie/ad", "item_id": "..."}` |
| **`PUT`** | `/playlists/:id/order` | **Reorder** the sequence of items in the list. | `:id` (Playlist ID) | N/A | `{"items_order": ["item_id_1", "item_id_2", ...]}` |

#### 🌐 Exposure (Data Aggregation)

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/graphql` | **Main endpoint for complex queries** and aggregated data return. | N/A | N/A | `{query: "...", variables: {}}` |

---

### 🍿 Products Service (Concessions, Stock, and POS)

Controls the Concessions **Product Catalog**, **Stock**, and **Sales** (Point of Sale - POS).

#### 🍫 Product Management

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/products` | **List** all products with price and stock level. | N/A | `category`, `in_stock` | N/A |
| **`POST`** | `/products` | **Add** a new product to the catalog. | N/A | N/A | `{"name": "...", "price": ..., "stock_level": ..., "category": "..."}` |
| **`PATCH`** | `/products/:id` | **Update** the price or description. | `:id` (Product ID) | N/A | `{"price": ...}` or `{"description": "..."}` |

#### 📦 Stock Control

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`PUT`** | `/products/:id/stock` | **Adjust** the stock level (replenishment or inventory adjustment). | `:id` (Product ID) | N/A | `{"adjustment": ..., "reason": "..."}` |

#### 💸 Point of Sale (POS) and Sales

| Method | Endpoint | Description | Path Params | Query Params | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/sales` | **Register** a new sale (automatic stock deduction). | N/A | N/A | `{"items": [{"product_id": "...", "quantity": ...}], "total_amount": ...}` |
| **`GET`** | `/sales` | Get the **report/history** of all registered sales. | N/A | `start_date`, `end_date`, `user_id` | N/A |
