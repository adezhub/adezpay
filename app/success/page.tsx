import Link from 'next/link';

async function getCheckoutSession(sessionId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/verify-session?session_id=${sessionId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const data = sessionId ? await getCheckoutSession(sessionId) : null;

  return (
    <main className="container">
      <div className="success-box">
        <div className="status-pill">Payment successful</div>
        <h1>Thank you for your purchase.</h1>
        <p className="small-text">
          Your payment has been confirmed and a receipt is ready to download.
        </p>

        {data ? (
          <div className="order-grid">
            <div className="info-card">
              <span>Status</span>
              <strong>{data.status}</strong>
            </div>
            <div className="info-card">
              <span>Email</span>
              <strong>{data.customerEmail || 'N/A'}</strong>
            </div>
            <div className="info-card">
              <span>Amount</span>
              <strong>
                ${(data.amountTotal / 100).toFixed(2)} {data.currency.toUpperCase()}
              </strong>
            </div>
          </div>
        ) : (
          <p className="small-text">Loading order details...</p>
        )}

        <div style={{ marginTop: '28px' }}>
          <Link href="/" className="primary-btn" style={{ display: 'inline-block' }}>
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
