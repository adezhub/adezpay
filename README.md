# adezpay

A working payment site built with Next.js, Stripe Checkout, Prisma, SQLite, and Safaricom Daraja M-Pesa STK Push.

## Features

- Product catalog
- Stripe card checkout
- M-Pesa STK Push checkout
- Daraja callback processing
- SQLite + Prisma order tracking
- Success and cancel pages

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in Stripe and Daraja credentials in `.env.local`.

4. Create/update the local database:
   ```bash
   npx prisma db push
   ```

5. Run the app:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## M-Pesa setup

Create a sandbox app in the Safaricom Daraja developer portal and set `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, and `MPESA_PASSKEY`. `MPESA_CALLBACK_URL` must be a public HTTPS URL pointing to `/api/mpesa/callback`; for local development, use a tunnel such as ngrok.

The app sends the product price rounded to Kenyan shillings. The callback marks the matching order as `paid` when `ResultCode` is `0`, or `failed` otherwise.

For production, use production Daraja credentials, a verified public domain, your real shortcode/passkey, HTTPS, and server-side secrets. Never commit `.env.local`.

## Stripe test card

Use Stripe test mode with `4242 4242 4242 4242`, any future date, and any CVC.
