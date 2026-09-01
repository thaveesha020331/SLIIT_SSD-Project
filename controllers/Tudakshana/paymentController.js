import Payment from '../../models/Tudakshana/Payment.js';
import Order from '../../models/Thaveesha/Order.js';
import Stripe from 'stripe';
import 'dotenv/config';
import User from '../../models/Tudakshana/User.js';

const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return null;
  return new Stripe(stripeSecretKey);
};

const normalizeBaseUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return url.trim().replace(/\/$/, '');
};

const isLocalUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

const getFrontendBaseUrl = (req) => {
  const configuredFrontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL);
  const requestOrigin = normalizeBaseUrl(req?.headers?.origin);

  let apiHost = req?.headers?.['x-forwarded-host'] || req?.headers?.host || null;
  if (typeof apiHost === 'string' && apiHost.includes(',')) {
    apiHost = apiHost.split(',')[0].trim();
  }

  let configuredMatchesApiHost = false;
  if (configuredFrontendUrl && apiHost) {
    try {
      const configuredHost = new URL(configuredFrontendUrl).host;
      configuredMatchesApiHost = configuredHost === apiHost;
    } catch {
      configuredMatchesApiHost = false;
    }
  }

  // In production, ignore localhost FRONTEND_URL to prevent bad Stripe redirects.
  if (
    configuredFrontendUrl &&
    !(process.env.NODE_ENV === 'production' && isLocalUrl(configuredFrontendUrl)) &&
    !configuredMatchesApiHost
  ) {
    return configuredFrontendUrl;
  }

  if (requestOrigin) return requestOrigin;

  const referer = req?.headers?.referer;
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // ignore invalid referer URL
    }
  }

  return 'http://localhost:5173';
};

const getCurrency = () => (process.env.STRIPE_CURRENCY || 'lkr').toLowerCase();

const MIN_STRIPE_AMOUNT_BY_CURRENCY = {
  lkr: 150,
  usd: 0.5,
};

const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const createStripeCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripeClient();
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in environment.',
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const currency = getCurrency();
    const minAmount = MIN_STRIPE_AMOUNT_BY_CURRENCY[currency] || 0.5;
    if (order.total < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum card payment for ${currency.toUpperCase()} is ${minAmount.toFixed(2)}. Use COD or increase order amount.`,
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    const frontendBaseUrl = getFrontendBaseUrl(req);
    const successUrl = `${frontendBaseUrl}/my-orders?stripe=success&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendBaseUrl}/checkout/${orderId}?stripe=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(order.total * 100),
            product_data: {
              name: `Order ${order._id}`,
              description: `Payment for order ${order._id}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: String(order._id),
        userId: String(userId),
      },
    });

    if (existingPayment) {
      await Payment.findByIdAndUpdate(existingPayment._id, {
        amount: order.total,
        paymentMethod: 'card',
        status: 'processing',
        paymentGateway: 'stripe',
        transactionId: session.id,
      });
    } else {
      await Payment.create({
        order: orderId,
        user: userId,
        amount: order.total,
        paymentMethod: 'card',
        status: 'processing',
        paymentGateway: 'stripe',
        transactionId: session.id,
      });
    }

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Create Stripe session error:', error?.raw?.message || error.message, error);
    return res.status(500).json({
      success: false,
      message: error?.raw?.message || error.message || 'Failed to create Stripe checkout session',
      error: error?.raw?.message || error.message,
    });
  }
};

export const stripeWebhook = async (req, res) => {
  const stripe = getStripeClient();
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(500).json({
      success: false,
      message: 'Stripe webhook is not configured',
    });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) {
        return res.status(200).json({ received: true });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(200).json({ received: true });
      }

      let payment = await Payment.findOne({ order: orderId });

      if (!payment) {
        payment = await Payment.create({
          order: orderId,
          user: userId,
          amount: (session.amount_total || 0) / 100,
          paymentMethod: 'card',
          status: 'completed',
          transactionId: session.payment_intent || session.id,
          paymentGateway: 'stripe',
          paymentDate: new Date(),
        });
      } else if (payment.status !== 'completed') {
        payment = await Payment.findByIdAndUpdate(
          payment._id,
          {
            status: 'completed',
            transactionId: session.payment_intent || session.id,
            paymentGateway: 'stripe',
            failureReason: null,
            paymentDate: new Date(),
          },
          { new: true }
        );
      }

      await Order.findByIdAndUpdate(orderId, {
        payment: payment._id,
        paymentStatus: 'completed',
      });

      // Store only non-sensitive Stripe card metadata for profile CRUD use.
      if (session.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ['payment_method'],
          });
          const card = paymentIntent?.payment_method?.card;

          if (card) {
            await User.findByIdAndUpdate(userId, {
              paymentCard: {
                preferredPaymentMethod: 'card',
                billingName: session.customer_details?.name || '',
                billingAddress: session.customer_details?.address
                  ? [
                    session.customer_details.address.line1,
                    session.customer_details.address.line2,
                    session.customer_details.address.city,
                    session.customer_details.address.state,
                    session.customer_details.address.postal_code,
                    session.customer_details.address.country,
                  ].filter(Boolean).join(', ')
                  : '',
                cardBrand: card.brand || '',
                cardNumberLast4: card.last4 || '',
                expiryMonth: card.exp_month || null,
                expiryYear: card.exp_year || null,
                updatedAt: new Date(),
              },
            });
          }
        } catch (metaError) {
          console.warn('Unable to persist Stripe card metadata for profile:', metaError.message);
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await Payment.findOneAndUpdate(
          { order: orderId, status: { $in: ['pending', 'processing'] } },
          { status: 'failed', failureReason: 'Checkout session expired' }
        );
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handling error:', error);
    return res.status(500).json({ success: false, message: 'Webhook handling failed' });
  }
};

export const processCardPayment = async (req, res) => {
  try {
    const { orderId, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;
    const userId = req.user.id;

    if (!orderId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return res.status(400).json({
        success: false,
        message: 'All card details are required',
      });
    }

    if (cardNumber.replace(/\s/g, '').length < 13 || cardNumber.replace(/\s/g, '').length > 19) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number',
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Card has expired',
      });
    }

    if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CVV',
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const cardBrand = detectCardBrand(cardNumber);

    const transactionId = generateTransactionId();

    const isPaymentSuccessful = Math.random() < 0.9;

    let payment;
    if (isPaymentSuccessful) {
      if (existingPayment) {
        payment = await Payment.findByIdAndUpdate(
          existingPayment._id,
          {
            amount: order.total,
            paymentMethod: 'card',
            status: 'completed',
            transactionId,
            cardDetails: {
              last4Digits: last4,
              cardBrand,
              expiryMonth: parseInt(expiryMonth, 10),
              expiryYear: parseInt(expiryYear, 10),
            },
            paymentDate: new Date(),
          },
          { new: true }
        );
      } else {
        payment = await Payment.create({
          order: orderId,
          user: userId,
          amount: order.total,
          paymentMethod: 'card',
          status: 'completed',
          transactionId,
          cardDetails: {
            last4Digits: last4,
            cardBrand,
            expiryMonth: parseInt(expiryMonth, 10),
            expiryYear: parseInt(expiryYear, 10),
          },
          paymentDate: new Date(),
        });
      }

      await Order.findByIdAndUpdate(orderId, {
        payment: payment._id,
        paymentStatus: 'completed',
      });

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        payment: {
          _id: payment._id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
          cardBrand: payment.cardDetails.cardBrand,
          last4Digits: payment.cardDetails.last4Digits,
        },
      });
    } else {
      const failureReasons = [
        'Insufficient funds',
        'Card declined',
        'Invalid card details',
        'Transaction declined by bank',
      ];
      const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

      if (existingPayment) {
        await Payment.findByIdAndUpdate(existingPayment._id, {
          status: 'failed',
          transactionId,
          failureReason,
        });
      } else {
        await Payment.create({
          order: orderId,
          user: userId,
          amount: order.total,
          paymentMethod: 'card',
          status: 'failed',
          transactionId,
          failureReason,
        });
      }

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
      });

      return res.status(400).json({
        success: false,
        message: `Payment failed: ${failureReason}`,
      });
    }
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message,
    });
  }
};

export const processCashOnDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    const transactionId = generateTransactionId();

    let payment;
    if (existingPayment) {
      payment = await Payment.findByIdAndUpdate(
        existingPayment._id,
        {
          amount: order.total,
          paymentMethod: 'cash_on_delivery',
          status: 'completed',
          transactionId,
          paymentDate: new Date(),
        },
        { new: true }
      );
    } else {
      payment = await Payment.create({
        order: orderId,
        user: userId,
        amount: order.total,
        paymentMethod: 'cash_on_delivery',
        status: 'completed',
        transactionId,
        paymentDate: new Date(),
      });
    }

    await Order.findByIdAndUpdate(orderId, {
      payment: payment._id,
      paymentStatus: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Cash on delivery confirmed',
      payment: {
        _id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: 'cash_on_delivery',
      },
    });
  } catch (error) {
    console.error('COD payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming cash on delivery',
      error: error.message,
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        _id: payment._id,
        order: payment.order,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate,
        failureReason: payment.failureReason || null,
        cardDetails: payment.cardDetails || null,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message,
    });
  }
};

export const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment found for this order',
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate,
        failureReason: payment.failureReason || null,
        cardDetails: payment.cardDetails || null,
      },
    });
  } catch (error) {
    console.error('Get payment by order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message,
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded',
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'cancelled' },
      { new: true }
    );

    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'failed',
    });

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      payment: {
        _id: updatedPayment._id,
        status: updatedPayment.status,
      },
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refunding payment',
      error: error.message,
    });
  }
};

const detectCardBrand = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return 'Visa';
  if (/^5[1-5][0-9]{14}$/.test(number)) return 'Mastercard';
  if (/^3[47][0-9]{13}$/.test(number)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return 'Discover';
  return 'Unknown';
};
