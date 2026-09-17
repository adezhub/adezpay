import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook secret is not configured.' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature error:', error.message);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    await prisma.order.upsert({
      where: {
        stripeSessionId: session.id,
      },
      update: {
        status: 'paid',
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        customerEmail: session.customer_details?.email ?? null,
        productName: session.metadata?.productId ?? 'unknown',
      },
      create: {
        stripeSessionId: session.id,
        status: 'paid',
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        customerEmail: session.customer_details?.email ?? null,
        productName: session.metadata?.productId ?? 'unknown',
      },
    });
  }

  return NextResponse.json({ received: true });
}
