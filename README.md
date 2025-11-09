# CONŌ CAFĒ — Web Shop (Final Project)

¡Bienvenido a CONŌ CAFĒ! ☕

CONŌ CAFĒ es más que café — es una conexión con la tradición, la calidad y el sabor único de las montañas de Boconó, Venezuela.

This repository contains a full-stack web shop for CONŌ CAFĒ built with Node.js, Express, MongoDB (Mongoose), Stripe for payments and a small static frontend using Tailwind CSS.

This README explains how to run the project locally, how to create an admin user, where the main code lives and how to troubleshoot common issues.

---

## Tech stack

- Node.js + Express
- MongoDB + Mongoose
- Stripe (checkout)
- Tailwind CSS for styling
- Plain HTML/JS views under `views/` (no SPA framework)

## Repository layout

- `app.js` — Express app configuration, middleware and route mounting
- `index.js` — server bootstrap (starts the `app`)
- `controllers/` — backend route handlers (auth, admin, checkout, contact, success, etc.)
- `models/` — Mongoose models (`users`, `product`, ...)
- `views/` — static frontend files (home, admin panel, login, success, styles)
- `controllers/createAdmin.js` — helper script to create/update the admin user

---

## Descripción rápida (Español)

CONŌ CAFĒ — Specialty Coffee from Boconó, Venezuela

Desde las exuberantes montañas de Boconó cultivamos café con propósito. A más de 1,200 metros sobre el nivel del mar, en suelos ricos y clima perfecto, nacen nuestros granos.

- Origen protegido: Primera Indicación Geográfica Protegida de Venezuela.
- Sostenible: Colaboramos con cooperativas locales.
- Taza con notas cítricas: lima, mandarina y durazno.

Contacto:

- Email: info@conocafe.com
- Location: Boconó, Venezuela

Si quieres que incorpore estas imágenes directamente en alguna vista estática (por ejemplo `views/home/index.html`) o que genere versiones PNG/JPG listas para producción, dímelo y las preparo.

## Requirements

- Node.js (LTS recommended, e.g. 18+)
- npm
- A MongoDB instance (Atlas recommended)
- (Optional) Stripe account and secret key for payments

## Environment variables

Create a `.env` file in the repository root with at least these variables:

```
MONGO_URI_TEST=<your-mongo-uri-for-dev>
MONGO_URI_PROD=<your-mongo-uri-for-prod>
STRIPE_SECRET_KEY=<stripe-secret>
BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin@cono.cafe
ADMIN_PASSWORD=Cono1234
JWT_SECRET=<a-strong-jwt-secret>
```

Notes:
- During development `npm run dev` the app uses the test URI (MONGO_URI_TEST) by default.
- In production (`npm run start`) the app uses the production URI (MONGO_URI_PROD).

## Install

```powershell
npm install
```

## Useful npm scripts

- `npm run dev` — start the app in development with nodemon (NODE_ENV=dev)
- `npm run start` — start the app in production (NODE_ENV=production)
- `npm run create-admin:dev` — create/update admin user in the development DB
- `npm run create-admin:prod` — create/update admin user in the production DB
- `npm run create-admin:all` — create/update admin user across configured URIs (if available)

Example (PowerShell):

```powershell
# Create admin in production DB
npm run create-admin:prod

# Start app in production
npm run start

# Start app in dev
npm run dev
```

## Create admin user

Use the provided helper script to create or reset the admin user using the values from your `.env`:

```powershell
npm run create-admin:prod   # production DB
npm run create-admin:dev    # development DB
```

The script logs which MongoDB URI it connects to — use that to verify the admin was created in the expected database.

## Endpoints (high level)

- `POST /api/auth/login` — login endpoint, sets an HttpOnly cookie `token` on success
- `POST /api/auth/logout` — logout endpoint, clears the cookie
- `GET /api/admin/products` — list products
- `POST /api/admin/products` — create product
- `PUT /api/admin/products/:id` — update product
- `DELETE /api/admin/products/:id` — delete product
- `POST /api/checkout` — create Stripe checkout session
- `GET /api/checkoutsuccess?session_id=...` — fetch checkout session details (used by success view)

Frontend pages are served from `views/` and static routes are mounted in `app.js`.

## Admin panel / uploads

- The admin panel is a static HTML page under `views/admin` that calls the API endpoints.
- Current behavior: the admin UI converts selected image files to Data URLs (base64) and sends them inside the JSON payload when creating/updating products. This works but is not efficient for large images.

Recommendations:
- For production use, switch to `multipart/form-data` with `multer` on the server and store uploads under `/uploads` or use an external storage like S3 or Cloudinary.

## Currency conversion

- The home page includes a client-side currency switcher. Prices are stored/shown with `data-price-usd` attributes (USD base) and converted using exchange rates.
- To avoid CORS issues the project contains an optional `controllers/rates.js` that can be mounted to proxy requests to an external rates API and cache results.

## Troubleshooting

- `PayloadTooLargeError` when uploading images: increase express json limits in `app.js` or switch to `multer` for multipart uploads (recommended).
- Login works locally but not after `npm run start`: ensure you created the admin in the production DB (`npm run create-admin:prod`) and that `MONGO_URI_PROD` is correct and accessible from the host.
- Cookie not deleted by logout: ensure the logout fetch uses `credentials: 'same-origin'` so the HttpOnly cookie is sent and the server can clear it.

## Next steps / improvements

- Migrate image uploads to `multer` and serve `/uploads` statically (or integrate a CDN/storage provider).
- Add server-side caching for exchange rates and serve them from `/api/rates`.
- Add tests and CI configuration.
- Harden cookie flags and token revocation strategy for production.

---

If you want, I can add a `.env.example`, implement `multer` upload handling, or mount the rates proxy and update the frontend to call it. Tell me which improvement you want next and I will implement it.
