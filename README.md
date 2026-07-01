<img width="1858" height="919" alt="image" src="https://github.com/user-attachments/assets/fb58a1cb-ffa1-4151-b580-9a14aac6f547" />

# Zuitt E-Commerce — Client (Capstone 3)

**Repository:** `csp3-cuanan-raval-ecommerce-client`
**Live demo:** https://csp3-cuanan-raval-ecommerce-client.vercel.app
**Team:** Arjay Cuanan · Maiki Raval

> This README was compiled by reviewing the public repository structure, `package.json`, and the project's `PRODUCT_SPEC.md`. Because the `src/` directory tree could not be crawled directly, folder-level detail is inferred from the product spec and standard Vue 3 + Vite conventions — verify exact paths against the live source before relying on them for automation.

---

## 1. Project Overview

TARO606 is a lightweight **e-commerce single-page application (SPA)** built as a capstone project. This repository is the **frontend client only**; it is designed to be paired with a separate Node/Express + MongoDB backend API (referenced in the product spec as `csp2-b606-cuanan-raval`).

### Problem it solves
Provides a fast, responsive storefront where shoppers can browse a product catalog, manage a cart, complete checkout, and leave reviews — while giving admins a dashboard to manage products, stock, and orders without touching the database directly.

### Core Features
| Area | Capability |
|---|---|
| **Catalog** | Product listing, search, filtering, pagination |
| **Product Detail** | Images, price, description, stock level, reviews |
| **Cart** | Add/remove items, quantity updates |
| **Checkout** | Address collection, payment step, order confirmation |
| **Orders** | Order history (customer) and order detail view (admin) |
| **Reviews** | Submit and display product reviews |
| **Auth** | Login, Register, Logout |
| **Admin Dashboard** | Product/stock CRUD, order visibility |

### Demo Credentials
> ⚠️ These are **seeded demo accounts** for local/staging use only — see [Security Boundaries](#6-security-boundaries) before using anything similar in production.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mail.com` | `admin123` |
| Customer | `customer@mail.com` | `customer123` |

---

## 2. Tech Stack

**Frontend framework**
- [Vue 3](https://vuejs.org/) `^3.5.32` (Composition API–ready)
- [Vite](https://vitejs.dev/) `^8.0.8` — dev server & build tool
- `@vitejs/plugin-vue` `^6.0.6`
- `vite-plugin-vue-devtools` `^8.1.1` (dev-only tooling)

**State & routing**
- [Pinia](https://pinia.vuejs.org/) `^3.0.4` — state management
- [Vue Router](https://router.vuejs.org/) `^4.6.4` — client-side routing

**HTTP & UI**
- [Axios](https://axios-http.com/) `^1.16.1` — API requests
- [Bootstrap](https://getbootstrap.com/) `^5.3.8` + Bootstrap Icons `^1.13.1` — layout/styling
- [GSAP](https://gsap.com/) `^3.15.0` — animation
- [Notyf](https://github.com/caroso1222/notyf) `^3.10.0` — toast notifications

**Runtime requirement**
- Node.js `^20.19.0` or `>=22.12.0` (per `engines` in `package.json`)

**Languages** (per GitHub's language breakdown): Vue SFC ~95%, JavaScript ~5%.

**Hosting**: Frontend deployed on [Vercel](https://vercel.com/).

---

## 3. Project Architecture

### Repository layout (root)
```
csp3-cuanan-raval-ecommerce-client/
├── .vscode/            # Editor workspace settings
├── public/             # Static assets served as-is
├── src/                # Application source (components, views, router, store)
├── .gitignore
├── PRODUCT_SPEC.md      # Product/feature specification
├── README.md
├── capstone3.json        # Project/course metadata
├── index.html            # Vite SPA entry point
├── jsconfig.json         # Editor/JS path resolution config
├── mcp_config.json        # MCP tool configuration (placeholder values only — see Security section)
├── package.json / package-lock.json
└── vite.config.js        # Vite build/dev configuration
```

### Expected `src/` structure (Vue 3 + Vite convention)
Based on the feature set in `PRODUCT_SPEC.md`, the source is organized around a typical Vue SPA pattern:

```
src/
├── assets/            # Images, styles, static SPA assets
├── components/          # Reusable UI components (Navbar, Footer, Sidebar, ProductCard, etc.)
├── views/               # Route-level pages (Home, Catalog, ProductDetail, Cart, Checkout, Orders, Admin, Login, Register)
├── router/              # Vue Router route definitions
├── stores/               # Pinia stores (auth, cart, products, orders)
├── services/             # API layer — e.g. services/api.js wrapping Axios calls
├── App.vue
└── main.js               # App bootstrap: mounts Vue, Pinia, Router
```

### Data flow
1. **View components** dispatch actions to **Pinia stores** (e.g., `cartStore`, `authStore`).
2. Stores call the **API service layer** (`src/services/api.js`), which uses **Axios** to talk to the separate backend REST API.
3. Backend endpoints referenced by the spec include `GET /api/products`, `GET /api/products/:id`, `POST /api/cart`, `POST /api/checkout`, `GET /api/orders/:id`, `POST /api/reviews`.
4. Responses update store state, which is reactively rendered in views; **Vue Router** governs navigation between catalog, product detail, cart, checkout, orders, and admin dashboard screens.
5. **Notyf** surfaces success/error toasts for API responses; **GSAP** drives page/element transitions.

### Backend dependency
This client expects a companion backend (Node.js/Express + MongoDB) to be running and reachable via a configured API base URL. The backend is **not included in this repository**.

---

## 4. Installation & Setup

### Prerequisites
- Node.js `^20.19.0` or `>=22.12.0`
- npm (bundled with Node)
- A running instance of the companion backend API (for full functionality)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/cuananarjayca-source/csp3-cuanan-raval-ecommerce-client.git
cd csp3-cuanan-raval-ecommerce-client

# 2. Install dependencies
npm install

# 3. Configure environment variables (see section 5)
cp .env.example .env   # if an .env.example exists; otherwise create .env manually

# 4. Start the local dev server
npm run dev
```

The dev server (Vite) will print a local URL — typically `http://localhost:5173`.

### Available scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with hot module reload |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally for a final check |

### Production build & deploy
```bash
npm run build
npm run preview   # sanity check the built output
```
The `dist/` folder is a static bundle that can be deployed to any static host (Vercel, Netlify, S3 + CDN, etc.). The project's live demo is hosted on **Vercel**, which auto-builds from the `main` branch using `npm run build` as the build command and `dist` as the output directory.

---

## 5. Usage & Configuration

### Environment variables
Vite exposes env vars prefixed with `VITE_` to client code via `import.meta.env`. Based on the app's dependency on a backend API, at minimum you should define:

```bash
# .env (create this file at the project root — DO NOT commit it)
VITE_API_BASE_URL=http://localhost:4000/api
```

Usage in code (`src/services/api.js` pattern):

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export default api
```

Example authenticated request pattern:

```js
import api from '@/services/api'

// attach token from Pinia auth store
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const fetchProducts = () => api.get('/products')
export const submitOrder = (payload) => api.post('/checkout', payload)
```

### Sample Pinia store shape
```js
// src/stores/cart.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] }),
  actions: {
    addItem(product) {
      this.items.push(product)
    },
  },
})
```

### Logging in with demo accounts
Use the credentials from [section 1](#project-overview) against the running backend to explore the Admin Dashboard and customer flows locally.

---

## 6. Security Boundaries

The project's own `PRODUCT_SPEC.md` explicitly calls out secrets handling. This team reinforces the following rules:

**Never commit to this repository:**
- `.env` files or any file containing real API keys, database URIs, or payment-provider secrets
- Real values inside `mcp_config.json` — treat any values currently in that file as placeholders only and replace them with environment-variable references before use
- Production backend URLs, admin credentials, or session tokens
- Payment gateway secret keys (only publishable/client-safe keys, if any, belong in frontend code)
- `node_modules/`, build artifacts (`dist/`), or local IDE state beyond what's already in `.gitignore`

**Best practices for contributors:**
- Confirm `.gitignore` covers `.env*`, `node_modules/`, and `dist/` before committing
- Use environment variables (`VITE_*`) for anything environment-specific — never hardcode API base URLs or keys in source
- The demo admin/customer credentials in this README are for a **seeded, non-production** dataset — rotate or remove them before any real deployment
- All payment processing must happen **server-side**; the client should never hold or transmit raw payment credentials beyond what a payment provider's client SDK explicitly permits
- Sanitize and validate all user input client-side as a UX convenience only — the backend remains the source of truth for validation and authorization

If you discover a committed secret in the repository history, rotate the affected credential immediately and scrub it from git history (e.g., via `git filter-repo` or BFG Repo-Cleaner) rather than relying on a follow-up commit alone.

---

## 7. Contributing Guidelines

1. **Fork & branch** — create a feature branch off `main`:
   ```bash
   git checkout -b feature/short-description
   ```
2. **Install & run locally** using the steps in [section 4](#4-installation--setup) before making changes.
3. **Code style** — follow existing Vue 3 SFC conventions (`<script setup>` where used, component-per-file, Pinia for shared state).
4. **Commit messages** — use clear, present-tense messages (e.g., `Add product filter to catalog view`).
5. **Test before pushing** — run `npm run build` locally to confirm the production build succeeds.
6. **Open a Pull Request** against `main`:
   - Describe what changed and why
   - Reference any related issue
   - Include screenshots/GIFs for UI changes
7. **Issues** — use the [Issues tab](https://github.com/cuananarjayca-source/csp3-cuanan-raval-ecommerce-client/issues) to report bugs or propose features. Include reproduction steps, expected vs. actual behavior, and environment details (Node version, OS).
8. **Never include secrets** in commits, PR descriptions, or screenshots.

---

## Team Credits

| Member | Focus Areas |
|---|---|
| **Maiki Raval** | Vue template: Login/Register/Logout, Admin Dashboard, Cart, Orders, Payments |
| **Arjay Cuanan** | Product catalog & detail, Home page, frontend design, navbar/footer/sidebar |

---
