# adezpay

A working payment site starter built with Next.js and Stripe.

Features:
- Product catalog
- Stripe Checkout integration
- Success and cancel pages
- Webhook handling for completed payments
- SQLite + Prisma order tracking

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in your Stripe keys in `.env.local`.

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Run the app:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Stripe test card

Use the following test card in Stripe test mode:
- 4242 4242 4242 4242
- Any future date
- Any CVC

## Webhook testing

```bash
stripe listen --forward-to localhost:3000/api/webhook
```
