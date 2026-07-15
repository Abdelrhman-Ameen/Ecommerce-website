# Ma3rad El Gamila

Ma3rad El Gamila is a production-oriented bilingual MEAN stack e-commerce platform based on the supplied Figma experience. It combines an Angular + Bootstrap storefront with an Express API and MongoDB Atlas.

## Release features

- Responsive storefront, staged catalog filtering, hybrid product recommendations, live cart quantities, checkout, and order history
- Register, login, logout, and persistent HTTP-only cookie sessions
- Customer and admin role authorization with Angular route guards and server-side enforcement
- Admin dashboard with revenue/COGS/profit analytics, product CRUD, order/customer details, and inventory metrics
- Frontend and backend validation, centralized API errors, rate limiting, security headers, loading states, and toast feedback
- Production build and a Vercel-compatible single-origin deployment
- English and Arabic localization with automatic RTL layout, plus a persistent light/dark theme
- Required Egyptian governorate/city checkout addressing and manual or automatic out-of-stock controls
- Defensive routing with guarded account/admin areas and a custom animated fashion 404 experience

The former AI/image-processing endpoints and local upload storage are intentionally not part of this release. Vercel functions do not provide durable local file storage, so catalog photography is bundled under `public/assets` and product CRUD accepts a validated asset path or HTTPS URL.

## Local setup

1. Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Install dependencies with `npm install`.
3. Seed the catalog and initial accounts with `npm run seed`.
4. Start the Angular app and Express API together with `npm run dev`.
5. Open `http://localhost:4200`.

## Commands

```bash
npm run dev
npm run build
npm test
npm run seed
npm run check:server
```

## Frontend architecture

- Standalone, lazy-loaded Angular pages with shared storefront and admin layouts
- Signals and computed state for lightweight UI state; RxJS for HTTP and route streams
- Reactive Forms for validated register, login, checkout, profile, password, and admin CRUD workflows
- Interpolation, property/attribute binding, event binding, conditional class/style binding, reusable component input binding, and focused two-way binding for the catalog search draft
- Route guards for guest, customer, and admin flows, exact default routes, an explicit `/404`, and a wildcard fallback
- Runtime English/Arabic localization with persisted language choice and document-level LTR/RTL direction

## API

The JSON API is served from `/api/v1`. Authentication uses a secure `HttpOnly` cookie. Major routes include:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /products`, `GET /products/:id`, plus admin product create/update/delete
- cart read/create/update/delete routes under `/cart`
- customer checkout and order history under `/orders`
- admin metrics and customer listing under `/admin`

Never commit `.env`. Rotate any database credential that has been shared outside a password manager.
