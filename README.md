# LuxeStudio Backend

REST API for the NTI MEAN Stack final project. It follows the same structure used in the course sessions: Express routes, controllers, Mongoose models, JWT authentication, role authorization, Multer uploads, filtering, sorting, and pagination.

## Features

- Customer signup/signin, profile, and favorite products
- Product catalog with search, filters, price ranges, sorting, and pagination
- Admin product CRUD with image uploads
- Persistent shopping cart with stock validation
- Checkout and order tracking (`ordered`, `processing`, `shipped`, `delivered`)
- Admin order management
- Product-photo quality, lighting, and noise checks
- AI background removal with transparent PNG output

## Run locally

1. Install Node.js 20+ and MongoDB.
2. Copy `.env.example` to `.env` and update its values.
3. Run:

```bash
npm install
npm run dev
```

The API starts at `http://localhost:5000/api/v1`.

## Main endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/auth/signup` | Public |
| POST | `/auth/signin` | Public |
| GET | `/auth/me` | Customer/Admin |
| PATCH | `/auth/favorites/:productId` | Customer/Admin |
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| POST/PATCH/DELETE | `/products` | Admin |
| GET/POST | `/cart` | Customer/Admin |
| PATCH/DELETE | `/cart/:productId` | Customer/Admin |
| POST | `/orders` | Customer/Admin |
| GET | `/orders/my-orders` | Customer/Admin |
| GET/PATCH | `/orders` | Admin |
| POST | `/images/analyze` | Customer/Admin |
| POST | `/images/remove-background` | Customer/Admin |

Send protected requests with `Authorization: Bearer TOKEN`. Image requests use `multipart/form-data` with a field named `image`.

## Product filtering examples

```text
GET /api/v1/products?category=decor&search=lamp
GET /api/v1/products?price[gte]=100&price[lte]=500&sort=-rating
GET /api/v1/products?featured=true&page=1&limit=12
```

The first background-removal request downloads the AI model and may take longer. Processed images are available under `/api/v1/uploads/processed/FILENAME`.
