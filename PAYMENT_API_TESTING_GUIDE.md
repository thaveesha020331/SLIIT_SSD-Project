# Payment System - API Testing Guide (Postman)

## Base URL
```
http://localhost:5001
```

## Authentication
All payment endpoints require a valid JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. PROCESS CARD PAYMENT

### Endpoint
```
POST /api/payments/process-card
```

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "orderId": "your_order_id_here",
  "cardNumber": "4532015112830366",
  "cardholderName": "John Doe",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123"
}
```

### Test Card Numbers (for demo)
- **Visa:** 4532015112830366
- **Mastercard:** 5425233010103010
- **American Express:** 374245455400126
- **Discover:** 6011111111111117

### Expected Response (Success)
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment": {
    "_id": "payment_id_here",
    "transactionId": "TXN-1708940654321-ABC12DEF34",
    "amount": 150.50,
    "status": "completed",
    "cardBrand": "Visa",
    "last4Digits": "0366"
  }
}
```

### Expected Response (Declined Card - 90% success rate)
```json
{
  "success": false,
  "message": "Payment failed: Insufficient funds"
}
```

### Notes
- Payment has a 90% success rate for demo purposes
- Possible failure reasons: "Insufficient funds", "Card declined", "Invalid card details", "Transaction declined by bank"
- Card details are masked in responses (only last 4 digits shown)
- Card brand is automatically detected

---

## 2. PROCESS CASH ON DELIVERY

### Endpoint
```
POST /api/payments/process-cod
```

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "orderId": "your_order_id_here"
}
```

### Expected Response (Always Success)
```json
{
  "success": true,
  "message": "Cash on delivery confirmed",
  "payment": {
    "_id": "payment_id_here",
    "transactionId": "TXN-1708940654321-XYZ98UVW12",
    "amount": 150.50,
    "status": "completed",
    "paymentMethod": "cash_on_delivery"
  }
}
```

### Notes
- COD payment is always confirmed immediately
- No validation needed beyond order verification
- Transaction ID is generated automatically

---

## 3. GET PAYMENT STATUS

### Endpoint
```
GET /api/payments/:paymentId
```

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### URL Parameters
- `paymentId` (required): The payment ID from the payment object

### Example Request
```
GET /api/payments/65a3b8c2d4e5f6g7h8i9j0k1
```

### Expected Response
```json
{
  "success": true,
  "payment": {
    "_id": "65a3b8c2d4e5f6g7h8i9j0k1",
    "order": "order_id_here",
    "amount": 150.50,
    "paymentMethod": "card",
    "status": "completed",
    "transactionId": "TXN-1708940654321-ABC12DEF34",
    "paymentDate": "2024-02-26T10:30:00Z",
    "failureReason": null,
    "cardDetails": {
      "last4Digits": "0366",
      "cardBrand": "Visa",
      "expiryMonth": 12,
      "expiryYear": 2025
    }
  }
}
```

---

## 4. GET PAYMENT BY ORDER ID

### Endpoint
```
GET /api/payments/order/:orderId
```

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### URL Parameters
- `orderId` (required): The order ID

### Example Request
```
GET /api/payments/order/65a3b8c2d4e5f6g7h8i9j0k1
```

### Expected Response
```json
{
  "success": true,
  "payment": {
    "_id": "payment_id_here",
    "amount": 150.50,
    "paymentMethod": "cash_on_delivery",
    "status": "completed",
    "transactionId": "TXN-1708940654321-XYZ98UVW12",
    "paymentDate": "2024-02-26T10:30:00Z",
    "failureReason": null,
    "cardDetails": null
  }
}
```

---

## 5. REFUND PAYMENT

### Endpoint
```
POST /api/payments/:paymentId/refund
```

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### URL Parameters
- `paymentId` (required): The payment ID to refund

### Request Body
```json
```
(Empty body)

### Example Request
```
POST /api/payments/65a3b8c2d4e5f6g7h8i9j0k1/refund
```

### Expected Response
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "payment": {
    "_id": "65a3b8c2d4e5f6g7h8i9j0k1",
    "status": "cancelled"
  }
}
```

### Error Response (If payment not completed)
```json
{
  "success": false,
  "message": "Only completed payments can be refunded"
}
```

---

## COMPLETE WORKFLOW TEST

### Step 1: Create an Order
```
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "phone": "+94771234567",
  "notes": "Deliver before 5 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "order_id_here",
    "total": 150.50,
    "status": "pending",
    ...
  }
}
```

### Step 2a: Pay with Card
```
POST /api/payments/process-card
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "orderId": "order_id_from_step1",
  "cardNumber": "4532015112830366",
  "cardholderName": "John Doe",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123"
}
```

**OR Step 2b: Pay with Cash on Delivery**
```
POST /api/payments/process-cod
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "orderId": "order_id_from_step1"
}
```

### Step 3: Check Payment Status
```
GET /api/payments/order/order_id_from_step1
Authorization: Bearer <jwt_token>
```

### Step 4: (Optional) Refund Payment
```
POST /api/payments/payment_id_from_step2/refund
Authorization: Bearer <jwt_token>
```

---

## ERROR HANDLING

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Not authorized. Please login to access this resource."
}
```

### Order Not Found (404)
```json
{
  "success": false,
  "message": "Order not found"
}
```

### Invalid Card (400)
```json
{
  "success": false,
  "message": "Invalid card number"
}
```

### Card Expired (400)
```json
{
  "success": false,
  "message": "Card has expired"
}
```

### Invalid CVV (400)
```json
{
  "success": false,
  "message": "Invalid CVV"
}
```

### Payment Already Completed (400)
```json
{
  "success": false,
  "message": "Payment already completed for this order"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Error processing payment",
  "error": "Detailed error message"
}
```

---

## VALIDATION RULES

### Card Number
- Length: 13-19 digits
- Supports Visa, Mastercard, American Express, Discover
- Test cards provided above

### Expiry Month
- Format: MM (01-12)
- Must not be in the past

### Expiry Year
- Format: YYYY
- Must be current year or later

### CVV
- Length: 3-4 digits (depending on card type)
- Only numeric characters allowed

### Cardholder Name
- Required, non-empty

### Order ID
- Must be a valid ObjectID
- Must belong to the authenticated user

---

## DATABASE SCHEMA

### Payment Collection
```javascript
{
  _id: ObjectId,
  order: ObjectId (ref: Order),
  user: ObjectId (ref: User),
  amount: Number,
  paymentMethod: "card" | "cash_on_delivery",
  status: "pending" | "processing" | "completed" | "failed" | "cancelled",
  transactionId: String (unique),
  cardDetails: {
    last4Digits: String,
    cardBrand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  paymentGateway: String,
  failureReason: String,
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Updates
The Order model now includes:
```javascript
{
  ...existingFields,
  payment: ObjectId (ref: Payment),
  paymentStatus: "pending" | "completed" | "failed"
}
```

---

## TESTING CHECKLIST

- [ ] Test card payment with valid card
- [ ] Test card payment with expired card
- [ ] Test card payment with invalid CVV
- [ ] Test card payment with invalid card number
- [ ] Test cash on delivery payment
- [ ] Get payment status
- [ ] Get payment by order ID
- [ ] Refund completed payment
- [ ] Try to refund non-completed payment
- [ ] Test authentication errors (missing token)
- [ ] Test with non-existent order ID
- [ ] Test payment already processed error

---

## NOTES FOR EVALUATION

1. **Demo Mode**: Card payments have 90% success rate for demo purposes
2. **Security**: In production, integrate with real payment gateway (Stripe, PayPal, etc.)
3. **Card Details**: Card details are never fully displayed, only last 4 digits
4. **Transaction ID**: Automatically generated and unique for each payment
5. **Payment Methods**: Support for both card and cash on delivery
6. **Order Integration**: Payments are linked to orders
7. **Refund Capability**: Can refund completed payments

---

## FRONTEND INTEGRATION

The payment form is integrated in the checkout page after order creation:

1. User creates order with shipping details
2. Redirected to `/checkout/:orderId`
3. Payment form shows with two options:
   - **Card Payment**: Credit/Debit card
   - **Cash on Delivery**: COD confirmation
4. After payment, redirected to order details

---

**Last Updated:** 27 February 2026  
**Prepared for:** Thaveesha's Payment Component  
**Status:** Ready for Testing
