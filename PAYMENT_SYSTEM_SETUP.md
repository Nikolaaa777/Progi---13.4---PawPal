# Payment System Setup Guide

A complete payment system has been implemented for your PawPal application, supporting both **PayPal** and **Stripe (Card)** payments.

## What Was Created

### Backend (Django)

1. **Payment Models** (`bekend/payments/models.py`)
   - `PlacanjeSetnje`: Maps to existing database table (managed=False)
   - `PaymentTracking`: New table for tracking payment status, transaction IDs, etc.

2. **Payment Views** (`bekend/payments/views.py`)
   - `create_payment_intent`: Creates PayPal orders or Stripe payment intents
   - `confirm_paypal_payment`: Confirms PayPal payments after user approval
   - `confirm_stripe_payment`: Confirms Stripe payments after card processing
   - `get_payment_status`: Gets payment status by ID
   - `get_user_payments`: Gets all payments for current user

3. **Payment Serializers** (`bekend/payments/serializers.py`)
   - `PaymentSerializer`: Serializes payment data including tracking info
   - `CreatePaymentIntentSerializer`: Validates payment creation requests
   - `ConfirmPaymentSerializer`: Validates payment confirmation requests

4. **URLs** (`bekend/payments/urls.py`)
   - All payment endpoints are registered

### Frontend (React)

1. **PaymentModal Component** (`frontend/src/components/PaymentModal.jsx`)
   - Modal dialog for payment processing
   - Supports both PayPal and Stripe
   - Handles payment flow and error states

2. **Payment Styles** (`frontend/src/components/PaymentModal.css`)
   - Styled payment modal with modern UI

3. **Payment Pages**
   - `PaymentExample.jsx`: Example page showing how to use the payment modal
   - `PaymentSuccess.jsx`: Success page for PayPal redirects

4. **API Client Updates** (`frontend/src/api/client.js`)
   - Added payment API methods

## Setup Instructions

### 1. Install Dependencies

```bash
cd bekend
pip install stripe requests
```

### 2. Environment Variables

Add to your `.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Frontend URL (for PayPal redirects)
FRONTEND_URL=http://localhost:5173  # or your production URL
```

### 3. Run Migrations

```bash
cd bekend
python manage.py migrate payments
```

This will create the `payment_tracking` table.

### 4. Get API Keys

**PayPal:**
1. Go to https://developer.paypal.com/
2. Create a new app
3. Copy Client ID and Secret
4. Use sandbox credentials for testing

**Stripe:**
1. Go to https://dashboard.stripe.com/
2. Navigate to Developers > API keys
3. Copy Secret key and Publishable key
4. Use test keys for development

## Usage Example

### In Your React Component

```jsx
import { useState } from "react";
import PaymentModal from "./components/PaymentModal";

function MyComponent() {
  const [showPayment, setShowPayment] = useState(false);
  const reservationId = 1; // Your reservation ID
  const amount = 50.00; // Payment amount

  const handlePaymentSuccess = (payment) => {
    console.log("Payment successful:", payment);
    // Update UI, show success message, etc.
  };

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Pay ${amount.toFixed(2)}
      </button>
      
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        reservationId={reservationId}
        amount={amount}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
```

## Payment Flow

### PayPal Flow
1. User selects PayPal → clicks "Continue to Payment"
2. User is redirected to PayPal for approval
3. After approval, PayPal redirects back to `/payment-success`
4. Payment is automatically confirmed
5. Success callback is triggered

### Stripe Flow
1. User selects Card → clicks "Continue to Payment"
2. Stripe card form appears in modal
3. User enters card details
4. Payment is processed
5. Payment is confirmed with backend
6. Success callback is triggered

## API Endpoints

### Create Payment Intent
```
POST /api/payments/create/
Body: {
  "reservation_id": 1,
  "amount": "50.00",
  "payment_method": "paypal" | "stripe"
}
```

### Confirm PayPal Payment
```
POST /api/payments/paypal/confirm/
Body: {
  "order_id": "paypal_order_id",
  "payment_id": 123
}
```

### Confirm Stripe Payment
```
POST /api/payments/stripe/confirm/
Body: {
  "payment_intent_id": "stripe_payment_intent_id",
  "payment_id": 123
}
```

### Get Payment Status
```
GET /api/payments/{payment_id}/
```

### Get User Payments
```
GET /api/payments/user/
```

## Testing

### PayPal Sandbox
- Use PayPal sandbox accounts
- Test with PayPal's test credentials

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC

## Database Schema

### PlacanjeSetnje (Existing Table)
- `idPlacanja`: Primary key
- `tipPlacanja`: Payment type (1 = PayPal, 2 = Card)
- `cijenaSetnje`: Amount in cents (bigint)
- `idRezervacije`: Reservation ID
- `idVlasnik`: Owner ID
- `idSetac`: Walker ID

### PaymentTracking (New Table)
- `idPlacanja`: Primary key (FK to PlacanjeSetnje)
- `payment_status`: pending, completed, failed, cancelled
- `transaction_id`: PayPal order ID or Stripe payment intent ID
- `payment_method`: 'paypal' or 'stripe'
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Important Notes

1. **Amount Storage**: Amounts are stored in cents (as bigint) in the database but handled as decimals in the application
2. **Reservation Required**: Payments must be linked to a reservation
3. **User Authentication**: All payment endpoints require authentication
4. **Error Handling**: All endpoints return proper error responses
5. **Security**: Never expose secret keys in frontend code

## Next Steps

1. Set up your PayPal and Stripe accounts
2. Add environment variables
3. Run migrations
4. Test with sandbox/test credentials
5. Integrate payment modal into your reservation flow
6. Switch to production credentials when ready

## Support

For issues or questions:
- Check the payment logs in Django console
- Verify API keys are correct
- Ensure reservations exist before creating payments
- Check PayPal/Stripe dashboards for transaction details
