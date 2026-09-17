import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const callback = payload?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const metadataItems = callback.CallbackMetadata?.Item || [];
    const metadata = Object.fromEntries(
      metadataItems
        .filter((item: { Name?: string }) => item.Name)
        .map((item: { Name: string; Value?: string | number }) => [item.Name, item.Value])
    ) as Record<string, string | number | undefined>;

    const isPaid = Number(callback.ResultCode) === 0;

    await prisma.order.updateMany({
      where: { mpesaCheckoutRequestId: callback.CheckoutRequestID },
      data: {
        status: isPaid ? 'paid' : 'failed',
        mpesaReceiptNumber: typeof metadata.MpesaReceiptNumber === 'string'
          ? metadata.MpesaReceiptNumber
          : undefined,
        customerPhone: typeof metadata.PhoneNumber === 'number'
          ? String(metadata.PhoneNumber)
          : undefined,
      },
    });

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    // A successful HTTP response prevents repeated callback delivery while the
    // payment remains queryable/reconcilable from the Daraja transaction status.
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
