"use client";

import { useState } from 'react';

export function MpesaButton({ productId }: { productId: string }) {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function payWithMpesa() {
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'STK Push failed.');
      setStatus(data.customerMessage || 'Check your phone and enter your M-Pesa PIN.');
    } catch (error: any) {
      setStatus(error.message || 'Unable to send payment prompt.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mpesa-box">
      <input
        className="phone-input"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="M-Pesa number e.g. 0712345678"
        inputMode="tel"
        aria-label="M-Pesa phone number"
      />
      <button className="mpesa-button" onClick={payWithMpesa} disabled={loading}>
        {loading ? 'Sending prompt...' : 'Pay with M-Pesa'}
      </button>
      {status && <p className="mpesa-status" role="status">{status}</p>}
    </div>
  );
}
