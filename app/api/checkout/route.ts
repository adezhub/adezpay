import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const products = {
  starter: {
    name: 'Starter Kit',
    description: 'Perfect for individuals and small projects.',
    price: 2900,
  },
  pro: {
    name: 'Pro Bundle',
    description: 'Built for growing teams and businesses.',
    price: 9900,
  },
  elite: {
    name: 'Elite Plan',
    description: 'Premium package with advanced support.',
    price: 24900,
  },
} as const;

export async function POST(request: Request) {
  try {
    const { productId, email } = await request.json();

    if (!productId || !(productId in products)) {
      return NextResponse.json({ error: 'Invalid product selected.' }, { status: 400 });
    }

    const product = products[productId as keyof typeof products];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,
      metadata: {
        productId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe checkout session.' },
      { status: 500 }
    );
  }
}
