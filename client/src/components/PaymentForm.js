import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function PaymentForm({ amount, onSuccess, disabled }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'eur' }),
      });
      const data = await res.json();
      if (!data.clientSecret) throw new Error(data.error || 'Erreur paiement');
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
      <div className="mb-2">
        <strong>Carte de test Stripe&nbsp;:</strong><br />
        <span className="text-muted small">
          Numéro&nbsp;: <b>4242 4242 4242 4242</b><br />
          Date d'expiration&nbsp;: <b>12/34</b> &nbsp; CVC&nbsp;: <b>123</b><br />
          (Aucune carte réelle ne sera débitée)
        </span>
      </div>
      {!stripe || !elements ? (
        <div className="text-danger">Chargement du module de paiement...</div>
      ) : (
        <CardElement options={{ hidePostalCode: true }} className="mb-2" />
      )}
      {error && <div className="text-danger mt-2">{error}</div>}
      <button className="btn btn-success mt-3" type="submit" disabled={!stripe || loading || disabled}>
        {loading ? 'Paiement en cours...' : 'Payer'}
      </button>
    </form>
  );
}
