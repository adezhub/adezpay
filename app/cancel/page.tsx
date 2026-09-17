import Link from 'next/link';

export default function CancelPage() {
  return (
    <main className="container">
      <div className="cancel-box">
        <div className="status-pill cancel">Payment cancelled</div>
        <h1>Your checkout was cancelled.</h1>
        <p className="small-text">
          No charge was made. You can return to the store and try again any time.
        </p>

        <div style={{ marginTop: '28px' }}>
          <Link href="/" className="secondary-btn" style={{ display: 'inline-block' }}>
            Back to store
          </Link>
        </div>
      </div>
    </main>
  );
}
