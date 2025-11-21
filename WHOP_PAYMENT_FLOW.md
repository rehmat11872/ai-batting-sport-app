# 💳 Whop Payment Flow & Webhook Setup Guide

## 📋 Overview

This document explains how Whop payment works, how to set up webhooks, and how the entire payment flow integrates with your app.

---

## 🔄 How Whop Payment Works

### 1. **User Flow**

```
User clicks "Upgrade to Premium"
    ↓
Redirects to Whop Checkout (https://whop.com/checkout/plan_XXX)
    ↓
User completes payment on Whop
    ↓
Whop sends webhook to your app
    ↓
Your app updates user membership status
    ↓
User gets premium access immediately
```

### 2. **Payment Methods**

Whop supports multiple payment methods:
- 💳 Credit/Debit Cards
- 💰 PayPal
- 🪙 Cryptocurrency
- 📱 Apple Pay / Google Pay
- And more...

**You don't handle payments directly** - Whop handles everything!

---

## 🎯 Payment Flow Steps

### Step 1: User Clicks Upgrade Button

In your app, users click "Upgrade to Premium" which links to:
```
https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
```

**Where to find your checkout URL:**
1. Go to Whop Dashboard
2. Navigate to your Product/Plan
3. Copy the checkout link
4. Add `?d2c=true` for direct checkout

### Step 2: User Completes Payment

- User is redirected to Whop checkout page
- User selects payment method and completes payment
- Whop processes the payment securely
- User is redirected back (optional)

### Step 3: Whop Sends Webhook

After successful payment, Whop sends a webhook to:
```
https://your-app.com/api/webhooks/whop
```

**Webhook Events:**
- `order.created` - When user subscribes/purchases
- `order.updated` - When subscription is updated
- `order.cancelled` - When subscription is cancelled
- `order.expired` - When subscription expires

### Step 4: Your App Updates Database

Your webhook handler (`app/api/webhooks/whop/route.ts`) receives the event and:
1. Extracts customer ID from webhook payload
2. Finds user in your database
3. Updates membership status to "active"
4. Stores plan ID and expiration date

### Step 5: User Gets Premium Access

- User's `isSubscribed` status becomes `true`
- All premium content unlocks automatically
- No page refresh needed (webhook updates database)

---

## 🔧 Webhook Setup

### 1. **Configure Webhook URL in Whop Dashboard**

1. Go to [Whop Dashboard](https://whop.com/dashboard)
2. Navigate to your App settings
3. Go to "Webhooks" section
4. Add webhook URL:
   ```
   https://your-app.com/api/webhooks/whop
   ```
   For local testing:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/whop
   ```

### 2. **Subscribe to Events**

Select these events in Whop Dashboard:
- ✅ `order.created` - User subscribes
- ✅ `order.updated` - Subscription updated
- ✅ `order.cancelled` - Subscription cancelled
- ✅ `order.expired` - Subscription expired
- ✅ `app.install` - User installs app (optional)

### 3. **Webhook Security (Recommended)**

Whop can sign webhooks with a secret. To verify:

```typescript
// In app/api/webhooks/whop/route.ts
import crypto from 'crypto';

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-whop-signature');
  const body = await request.text();
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', WHOP_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Process webhook...
}
```

**Note:** Current implementation accepts all webhooks. Add signature verification for production.

---

## 📦 Webhook Payload Structure

### `order.created` Event

```json
{
  "type": "order.created",
  "data": {
    "order": {
      "id": "order_xxx",
      "status": "active",
      "plan_id": "plan_GKSAvo4qoQDGU",
      "expires_at": "2025-12-31T23:59:59Z"
    },
    "customer": {
      "id": "customer_xxx",
      "email": "user@example.com",
      "username": "johndoe"
    }
  }
}
```

### `order.cancelled` Event

```json
{
  "type": "order.cancelled",
  "data": {
    "order": {
      "id": "order_xxx",
      "status": "cancelled"
    },
    "customer": {
      "id": "customer_xxx"
    }
  }
}
```

---

## 🎨 Premium Access Implementation

### Current Implementation

**Free Users See:**
- ✅ 2-3 predictions per section
- ✅ 2-3 games per sport (NBA, NFL, Soccer)
- ✅ Basic weather data
- ❌ Premium predictions locked

**Premium Users See:**
- ✅ **ALL** predictions (unlimited)
- ✅ **ALL** games for all sports
- ✅ Full weather insights
- ✅ Advanced analytics

### How It Works

In `components/dashboard-content.tsx`:

```typescript
const freeLimit = 2;
const displayPredictions = isSubscribed 
  ? predictions  // Show ALL
  : predictions.slice(0, freeLimit);  // Show only 2-3

const hiddenPredictions = isSubscribed 
  ? 0 
  : Math.max(0, predictions.length - freeLimit);
```

**When user upgrades:**
1. Webhook fires → Updates database
2. `isSubscribed` becomes `true`
3. User sees ALL cards immediately
4. No page refresh needed (if using real-time updates)

---

## 🔍 Testing Webhooks Locally

### Option 1: Use ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Add to Whop Dashboard: https://abc123.ngrok.io/api/webhooks/whop
```

### Option 2: Use Whop Test Mode

1. Go to Whop Dashboard → Test Mode
2. Create test orders
3. Webhooks will fire to your test endpoint

### Option 3: Manual Testing

Use a tool like [webhook.site](https://webhook.site) to test webhook payloads.

---

## 📊 Database Schema

### Membership Table

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  whop_plan_id TEXT,
  status TEXT CHECK (status IN ('active', 'expired', 'trial', 'canceled')),
  access_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Status Values

- `active` - User has active subscription
- `expired` - Subscription expired
- `trial` - User on trial (if applicable)
- `canceled` - User cancelled subscription

---

## 🚀 Complete Flow Diagram

```
┌─────────────┐
│   User      │
│  Dashboard  │
└──────┬──────┘
       │
       │ Clicks "Upgrade"
       ↓
┌─────────────────────┐
│  Whop Checkout      │
│  (Payment Page)     │
└──────┬──────────────┘
       │
       │ Payment Complete
       ↓
┌─────────────────────┐
│  Whop Processes     │
│  Payment            │
└──────┬──────────────┘
       │
       │ Sends Webhook
       ↓
┌─────────────────────┐
│  Your Webhook       │
│  /api/webhooks/whop│
└──────┬──────────────┘
       │
       │ Updates Database
       ↓
┌─────────────────────┐
│  Supabase Database  │
│  membership.status  │
│  = "active"         │
└──────┬──────────────┘
       │
       │ User's next request
       ↓
┌─────────────────────┐
│  getSession()       │
│  Checks membership  │
└──────┬──────────────┘
       │
       │ isSubscribed = true
       ↓
┌─────────────────────┐
│  Dashboard Shows    │
│  ALL Premium Content│
└─────────────────────┘
```

---

## ✅ Checklist for Production

- [ ] Webhook URL configured in Whop Dashboard
- [ ] Webhook events subscribed (order.created, order.cancelled, etc.)
- [ ] Webhook secret configured (for signature verification)
- [ ] Test webhook with test payment
- [ ] Verify database updates correctly
- [ ] Test premium access unlocks
- [ ] Test cancellation flow
- [ ] Monitor webhook logs
- [ ] Set up error alerts

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

1. **Check URL** - Must be publicly accessible (use ngrok for local)
2. **Check Events** - Ensure subscribed in Whop Dashboard
3. **Check Logs** - Check server logs for incoming requests
4. **Test Endpoint** - Use webhook.site to verify URL works

### Payment Complete But No Premium Access

1. **Check Webhook** - Verify webhook fired (check Whop Dashboard logs)
2. **Check Database** - Verify membership status updated
3. **Check Session** - User may need to refresh/logout-login
4. **Check Logs** - Look for errors in webhook handler

### User Shows Premium But Shouldn't

1. **Check Membership** - Verify `status = "active"` in database
2. **Check Expiration** - Verify `accessExpiresAt` not expired
3. **Check Session** - Clear session and re-login

---

## 📚 Resources

- [Whop API Docs](https://dev.whop.com)
- [Whop Webhooks Guide](https://dev.whop.com/api-reference/webhooks)
- [Whop Payment Docs](https://dev.whop.com/api-reference/payments)

---

## 🎯 Summary

1. **User clicks upgrade** → Redirects to Whop checkout
2. **User pays** → Whop processes payment
3. **Webhook fires** → Your app receives `order.created` event
4. **Database updates** → Membership status = "active"
5. **Premium unlocks** → User sees ALL content immediately

**Key Points:**
- ✅ Whop handles all payment processing
- ✅ Webhooks update your database automatically
- ✅ Premium access unlocks instantly
- ✅ No manual intervention needed

