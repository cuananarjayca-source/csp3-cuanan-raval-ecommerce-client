# Product Specification — Zuiit E‑commerce (b606-csp3-cuanan-raval)

## Overview

A lightweight e-commerce web app for selling products, managing inventory, processing orders and payments, and collecting customer reviews. The repository contains a Vue frontend (SPA) and a Node/Express backend API.

## Goals

- Provide a fast product catalog and checkout experience.
- Enable simple admin flows for product, stock, and review management.
- Support secure payments and order tracking.

## Success Metrics

- Conversion rate (visitors → purchases) > 2% within launch month.
- Checkout completion rate > 85% for users who add items to cart.
- Page load TTFB < 200ms on product pages.

## Target Users & Personas

- Shopper: Browses catalog, reads reviews, buys products.
- Admin: Adds/updates products, views orders, manages stock.
- Customer Support: Views orders, assists with returns/refunds.

## Key Features

- Product Catalog: Categories, search, filtering, pagination.
- Product Detail: Images, price, description, stock, reviews.
- Shopping Cart: Add/remove, quantity updates, saved carts.
- Checkout: Address collection, payment, order confirmation.
- Orders: Order history for users, order details for admins.
- Payments: Integrate with payment provider (server-side).
- Reviews: Submit and display product reviews with moderation.
- Admin Dashboard: CRUD for products, stock management, order view.

## User Stories (representative)

- As a Shopper, I can search and filter products so I quickly find items.
- As a Shopper, I can add items to a cart and complete payment in one flow.
- As an Admin, I can create or update a product with images and stock levels.
- As a Customer, I can view my orders and get order details and status.

## API & Data Model Highlights

- Frontend uses `src/services/api.js` and backend endpoints under `routes/`.
- Important endpoints (examples):
  - `GET /api/products` — list products
  - `GET /api/products/:id` — product detail
  - `POST /api/cart` — update cart
  - `POST /api/checkout` — create order / process payment
  - `GET /api/orders/:id` — order detail
  - `POST /api/reviews` — submit review

## Tech Stack

- Frontend: Vue 3 (Vite), single-page app in `b606-csp3-cuanan-raval/src`.
- Backend: Node.js + Express, controllers in `csp2-b606-cuanan-raval/controllers`.
- DB: MongoDB (models present in `models/`).
- Payments: Server-side integration (see `payment.js` controller).

## Non-Functional Requirements

- Secure storage of API keys and secrets (do not commit to repo).
- Input validation and sanitization for all public endpoints.
- Logging and basic error reporting for backend services.
- Responsive UI, accessible components for product pages.

## Security & Secrets

- Replace placeholders in `mcp_config.json` and any `.env.example` with secrets stored in environment variables or a secrets manager.
- Ensure payment provider keys never appear in source control.

## Deployment & Runtime

- Build frontend with Vite; serve static build via CDN or Node server.
- Backend runs on Node.js 18+; ensure environment variables for DB and payment provider are set for each environment.

## Milestones & Roadmap

1. Stabilize product listing and product detail pages (1 week).
2. Implement cart and checkout with payment integration (2 weeks).
3. Build admin product management flows and stock sync (1 week).
4. Add review moderation and order history pages (1 week).

## Acceptance Criteria

- Catalog returns products with images and prices.
- Checkout completes and creates an order record in DB.
- Admin can add/edit/delete products and adjust stock.
- No secrets committed; CI/build reads secrets from environment.

---

If you want, I can: add a short README section linking to this file, convert this into a templated PR-ready spec, or tailor the spec to a specific release. Tell me which.
