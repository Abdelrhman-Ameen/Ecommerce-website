# LuxeStudio

This is the backend for my NTI MEAN Stack final project.

The project is an e-commerce website for studio products. It also has image tools that check the uploaded photo quality and remove its background.

## Technologies

- Node.js and Express
- MongoDB and Mongoose
- JWT for authentication
- Multer for uploading images
- Sharp for checking image quality
- IMG.LY background removal

## Project structure

I followed the same structure used during the backend sessions:

- `models` contains the Mongoose schemas.
- `controllers` contains the logic for each request.
- `routes` contains the API endpoints.
- `middleware` contains authentication, authorization, and Multer.
- `config` contains the database connection.
- `utils` contains small shared functions.

## Main features

- Sign up and sign in
- Customer and admin roles
- Add, edit, delete, and display products
- Search, filter, sort, and paginate products
- Add products to favorites
- Add, update, and remove cart items
- Create orders and follow their status
- Check image resolution, lighting, and noise
- Remove the image background and save it as PNG

## Running the project

Install the packages:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
```

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000/api/v1`.

## API routes

Authentication:

```text
POST  /auth/signup
POST  /auth/signin
GET   /auth/me
PATCH /auth/favorites/:productId
```

Products:

```text
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

Cart and orders:

```text
GET    /cart
POST   /cart
PATCH  /cart/:productId
DELETE /cart/:productId
POST   /orders
GET    /orders/my-orders
GET    /orders/:id
```

Image processing:

```text
POST /images/analyze
POST /images/remove-background
```

Protected routes need the token in the request header:

```text
Authorization: Bearer TOKEN
```

Images are sent as `multipart/form-data` using a field named `image`.

The image-quality check uses the photo dimensions, average brightness, and the difference between neighboring grayscale pixels. The background-removal model then produces a transparent PNG if the uploaded image quality is acceptable.
