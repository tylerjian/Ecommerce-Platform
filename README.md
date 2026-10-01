# ShopNext — Full-Stack E-Commerce Platform

A production-ready e-commerce application built with Next.js 14, PostgreSQL, Stripe payments, and Google OAuth.

## Features

- **Product catalog** — search, filter by category, product detail pages
- **Shopping cart** — persistent cart with quantity management
- **Checkout** — Stripe-powered checkout with order confirmation emails
- **Authentication** — email/password sign-up and Google OAuth via NextAuth.js
- **Order tracking** — full order history with status updates (Pending → Paid → Shipped → Delivered)
- **Admin dashboard** — create, edit, and delete products; monitor all orders
- **Stock management** — real-time inventory checks during cart and checkout operations
- **Role-based access** — USER and ADMIN roles enforced across UI and API routes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v4 (Google OAuth + credentials) |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend |
| Styling | Tailwind CSS |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Google Cloud OAuth credentials
- Resend account (for order confirmation emails)

### 1. Clone and install

```bash
git clone <repo-url>
cd ecommerce
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://localhost:5432/ecommerce"

# NextAuth
NEXTAUTH_SECRET="your-secret-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth — https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend — https://resend.com/api-keys
RESEND_API_KEY="re_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Run migrations and generate the Prisma client
npm run db:migrate

# Seed with sample products
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Configure Stripe webhooks (for local development)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in your `.env`.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home — product grid with search & filters
│   ├── products/[id]/            # Product detail page
│   ├── cart/                     # Cart page (auth required)
│   ├── orders/                   # Order history (auth required)
│   ├── admin/                    # Admin dashboard (admin role required)
│   ├── auth/
│   │   ├── signin/               # Sign-in page
│   │   └── signup/               # Registration page
│   ├── checkout/
│   │   └── success/              # Post-payment confirmation
│   └── api/
│       ├── auth/                 # NextAuth + signup endpoint
│       ├── cart/                 # Cart CRUD
│       ├── checkout/             # Stripe session creation
│       ├── orders/               # Order listing
│       ├── admin/products/       # Admin product management
│       └── webhooks/stripe/      # Stripe payment webhook
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductGrid.tsx
│   ├── ProductCard.tsx
│   ├── AddToCartButton.tsx
│   ├── AdminDashboard.tsx
│   └── emails/OrderConfirmationEmail.tsx
└── lib/
    └── ...                       # Prisma client, auth config, utilities
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes without a migration |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

## Database Schema

```
User ──< Order ──< OrderItem >── Product
User ──< Cart  ──< CartItem  >── Product
```

- **User** — email/password or OAuth, with `USER` or `ADMIN` role
- **Product** — name, price, category, stock, featured flag
- **Order** — status enum: `PENDING | PAID | SHIPPED | DELIVERED | CANCELLED`
- **Cart** — one cart per user, holds CartItems with quantity

## Payment Flow

1. User adds items to cart and proceeds to checkout
2. `POST /api/checkout` creates a Stripe Checkout session and a `PENDING` order
3. User completes payment on Stripe's hosted page
4. Stripe sends a `checkout.session.completed` event to `/api/webhooks/stripe`
5. Webhook marks the order `PAID`, decrements stock, clears the cart, and sends a confirmation email
6. User is redirected to `/checkout/success`

## Creating an Admin Account

After seeding the database, promote a user to admin directly via Prisma Studio or psql:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or open Prisma Studio and edit the role field:

```bash
npm run db:studio
```

## Deployment

1. Provision a PostgreSQL database (e.g. Supabase, Railway, Neon)
2. Set all environment variables in your hosting provider
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL
4. Register your production URL as an authorized redirect URI in the Google Cloud Console
5. Add your production webhook endpoint in the Stripe dashboard and update `STRIPE_WEBHOOK_SECRET`

```bash
npm run build
npm start
```
