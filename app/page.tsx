"use client";

import { useState } from 'react';
import { MpesaButton } from '@/components/mpesa-button';

const products = [
  { id: 'starter', name: 'Starter Kit', description: 'Perfect for individuals and small projects.', price: 2900 },
  { id: 'pro', name: 'Pro Bundle', description: 'Built for growing teams and businesses.', price: 9900 },
  { id: 'elite', name: 'Elite Plan', description: 'Premium package with advanced support.', price: 24900 },
];

export default function HomePage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCheckout(productId: string) {
    setLoadingId(productId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: 'customer@example.com' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed.');
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert('Something went wrong while creating checkout.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="container">
      <header className="topbar">
        <div className="brand">AdezPay</div>
        <nav className="nav"><span>Features</span><span>Pricing</span><span>Help</span></nav>
      </header>

      <section className="hero">
        <div className="hero-card">
          <div className="badge">Fast secure payments</div>
          <h1>Turn clicks into cash with a better checkout.</h1>
          <p className="subtitle">Accept card payments with Stripe or send a secure M-Pesa prompt directly to a Kenyan customer&apos;s phone.</p>
          <div className="cta-row"><button className="primary-btn">Get started</button><button className="secondary-btn">View pricing</button></div>
        </div>
        <div className="hero-card mini-stat"><div className="mini-label">This month</div><div className="mini-total">$28,400</div><div className="mini-sub">Gross revenue</div><div className="chart"><span className="bar one" /><span className="bar two" /><span className="bar three" /><span className="bar four" /><span className="bar five" /></div></div>
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-visual" />
            <div className="product-body">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div className="product-meta"><span className="price">${(product.price / 100).toFixed(2)}</span></div>
              <button className="checkout-button" onClick={() => handleCheckout(product.id)} disabled={loadingId === product.id}>{loadingId === product.id ? 'Processing...' : 'Pay by card'}</button>
              <MpesaButton productId={product.id} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
