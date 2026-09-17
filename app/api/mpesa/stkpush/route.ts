import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateMpesaStkPush, normalizeKenyanPhone } from '@/lib/mpesa';

export async function POST(request: Request) {
  try {
    const { productId, phone } = await request.json();
    const products = {
      starter: { name: 'Starter Kit', price: 2900 },
      pro: { name: 'Pro Bundle', price: 9900 },
      elite: { name: 'Elite Plan', price: 24900 },
    } as const;

    if (!productId || !(productId in products)) {
      return NextResponse.json({ error: 'Invalid product selected.' }, { status: 400 });
    }

    const normalizedPhone = normalizeKenyanPhone(String(phone || ''));
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Enter a valid Kenyan Safaricom number, for example 0712345678.' },
        { status: 400 }
      );
    }

    const product = products[productId as keyof typeof products];
    const result = await initiateMpesaStkPush({
      amount: Math.ceil(product.price / 100),
      phone: normalizedPhone,
      accountReference: `ADEZ-${productId.toUpperCase()}`,
      transactionDescription: product.name,
    });

    await prisma.order.create({
      data: {
        mpesaCheckoutRequestId: result.CheckoutRequestID,
        customerPhone: normalizedPhone,
        amountTotal: Math.ceil(product.price / 100),
        currency: 'kes',
        status: 'pending',
        productName: product.name,
      },
    });

    return NextResponse.json({
      success: true,
      customerMessage: result.CustomerMessage || 'Check your phone and enter your M-Pesa PIN.',
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (error: any) {
    console.error('M-Pesa STK Push error:', error);
    return NextResponse.json(
      { error: error.message || 'Could not send the M-Pesa payment prompt.' },
      { status: 500 }
    );
  }
}
