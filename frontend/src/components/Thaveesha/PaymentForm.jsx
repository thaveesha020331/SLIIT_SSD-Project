import React, { useEffect, useState } from 'react';
import './PaymentForm.css';
import paymentAPI from '../../services/Thaveesha/paymentService';
import { authAPI } from '../../services/Tudakshana/authService';

export default function PaymentForm({ orderId, orderTotal, onPaymentSuccess, onPaymentError }) {
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [savedCard, setSavedCard] = useState(null);

  useEffect(() => {
    const loadSavedCard = async () => {
      try {
        const response = await authAPI.getProfile();
        const paymentCard = response?.data?.user?.paymentCard;
        if (paymentCard?.cardNumberLast4) {
          setSavedCard(paymentCard);
        }
      } catch (error) {
        // Profile/card preload should not block payment flow.
      }
    };

    loadSavedCard();
  }, []);

  const handleCardPayment = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await paymentAPI.createStripeCheckoutSession(orderId);
      if (!response?.success || !response?.url) {
        throw new Error(response?.message || 'Failed to initialize Stripe checkout');
      }

      window.location.href = response.url;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Stripe checkout failed';
      onPaymentError(errorMessage);
      setLoading(false);
      return;
    } finally {
      // Keep button disabled while browser redirects to Stripe.
    }
  };

  const handleCashOnDelivery = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('🔵 COD handler started with orderId:', orderId);

    try {
      console.log('📡 Calling processCashOnDelivery...');
      const response = await paymentAPI.processCashOnDelivery(orderId);
      console.log('✅ COD API Response:', response);

      if (response.success) {
        console.log('✅ Payment successful!');
        onPaymentSuccess({
          paymentId: response.payment._id,
          transactionId: response.payment.transactionId,
          status: response.payment.status,
          method: 'cash_on_delivery',
          message: response.message,
        });
      } else {
        console.log('❌ Payment not successful:', response.message);
        onPaymentError(response.message);
      }
    } catch (error) {
      console.error('❌ COD API Error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'COD confirmation failed';
      console.log('Error message to show:', errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h2>Select Payment Method</h2>
        <p className="order-total">Order Total: <strong>${orderTotal.toFixed(2)}</strong></p>
      </div>

      <div className="payment-methods">
        {/* Cash on Delivery */}
        <div 
          className={`payment-method-card ${paymentMethod === 'cash_on_delivery' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('cash_on_delivery')}
        >
          <input
            type="radio"
            id="cod"
            name="paymentMethod"
            value="cash_on_delivery"
            checked={paymentMethod === 'cash_on_delivery'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <label htmlFor="cod">
            <div className="payment-icon">💵</div>
            <div className="payment-info">
              <h3>Cash on Delivery</h3>
              <p>Pay when your order arrives</p>
            </div>
          </label>
        </div>

        {/* Card Payment */}
        <div 
          className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          <input
            type="radio"
            id="card"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <label htmlFor="card">
            <div className="payment-icon">💳</div>
            <div className="payment-info">
              <h3>Credit/Debit Card</h3>
              <p>Visa, Mastercard, Amex</p>
            </div>
          </label>
        </div>
      </div>

      {/* Card Details Form */}
      {paymentMethod === 'card' && (
        <form className="card-details-form" onSubmit={handleCardPayment}>
          <div className="form-section">
            <h3>Pay Securely with Stripe (Sandbox)</h3>

            {savedCard?.cardNumberLast4 && (
              <div className="saved-card-banner">
                <p>
                  Saved card on profile: **** **** **** {savedCard.cardNumberLast4}
                  {savedCard.expiryMonth && savedCard.expiryYear
                    ? ` (Exp: ${String(savedCard.expiryMonth).padStart(2, '0')}/${String(savedCard.expiryYear).slice(-2)})`
                    : ''}
                </p>
                <p className="saved-card-note">Card data is collected on Stripe hosted checkout in test mode.</p>
              </div>
            )}

            <p className="security-note">You will be redirected to Stripe's secure test checkout page.</p>

            <button
              type="submit"
              className="btn-pay"
              disabled={loading}
            >
              {loading ? 'Redirecting to Stripe...' : `Pay $${orderTotal.toFixed(2)} with Stripe`}
            </button>
          </div>
        </form>
      )}

      {/* Cash on Delivery Confirmation */}
      {paymentMethod === 'cash_on_delivery' && (
        <form className="cod-form" onSubmit={handleCashOnDelivery}>
          <div className="cod-info">
            <h3>Cash on Delivery</h3>
            <p>You will pay <strong>${orderTotal.toFixed(2)}</strong> when your order is delivered.</p>
            <ul className="cod-benefits">
              <li>✓ No upfront payment required</li>
              <li>✓ Inspect items before payment</li>
              <li>✓ Pay to the delivery agent</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn-confirm-cod"
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm Cash on Delivery'}
          </button>
        </form>
      )}
    </div>
  );
}
