# Payment System Documentation

This payment system supports both PayPal and Stripe (card) payments for the PawPal application.

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   pip install stripe requests
   ```

2. **Environment Variables**
   Add the following to your `.env` file:
   ```env
   # PayPal Configuration
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox  # or 'live' for production
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

3. **PayPal Setup**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Create a new app
   - Copy the Client ID and Secret
   - Use sandbox credentials for testing

4. **Stripe Setup**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Get your API keys from the Developers section
   - Use test keys for development

### Frontend Setup

The frontend automatically loads Stripe.js from CDN. No additional setup needed.

## Usage

### Using the Payment Modal Component

```jsx
import PaymentModal from "./components/PaymentModal";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  const handlePaymentSuccess = (payment) => {
    console.log("Payment completed:", payment);
    // Handle successful payment
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Pay Now</button>
      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reservationId={1}
        amount={50.00}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
```

### API Endpoints

#### Create Payment Intent
```
POST /api/payments/create/
Body: {
  "reservation_id": 1,
  "amount": "50.00",
  "payment_method": "paypal" | "stripe"
}
```

#### Confirm PayPal Payment
```
POST /api/payments/paypal/confirm/
Body: {
  "order_id": "paypal_order_id",
  "payment_id": 123
}
```

#### Confirm Stripe Payment
```
POST /api/payments/stripe/confirm/
Body: {
  "payment_intent_id": "stripe_payment_intent_id",
  "payment_id": 123
}
```

#### Get Payment Status
```
GET /api/payments/{payment_id}/
```

#### Get User Payments
```
GET /api/payments/user/
```

## Payment Flow

### PayPal Flow
1. User selects PayPal payment method
2. Frontend creates payment intent via API
3. User is redirected to PayPal for approval
4. After approval, PayPal redirects back with token
5. Frontend confirms payment with backend
6. Payment status is updated to "completed"

### Stripe Flow
1. User selects card payment method
2. Frontend creates payment intent via API
3. Stripe Elements card form is displayed
4. User enters card details
5. Payment is processed via Stripe
6. Frontend confirms payment with backend
7. Payment status is updated to "completed"

## Database Schema

The payment system uses the `PlacanjeSetnje` table with the following structure:
- `idPlacanja`: Primary key
- `tipPlacanja`: Payment type (1 = PayPal, 2 = Card)
- `cijenaSetnje`: Payment amount
- `idRezervacije`: Reservation ID
- `idVlasnik`: Owner ID
- `idSetac`: Walker ID
- `payment_status`: Status (pending, completed, failed, cancelled)
- `payment_id`: PayPal order ID or Stripe payment intent ID
- `payment_method`: 'paypal' or 'stripe'
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Testing

### PayPal Sandbox
- Use PayPal sandbox accounts for testing
- Test cards: Use PayPal's test card numbers

### Stripe Test Mode
- Use Stripe test card numbers:
  - Success: 4242 4242 4242 4242
  - Decline: 4000 0000 0000 0002
  - Use any future expiry date and any CVC

## Security Notes

- Never expose secret keys in frontend code
- Always validate payments on the backend
- Use HTTPS in production
- Store sensitive credentials in environment variables
- Implement proper error handling and logging
