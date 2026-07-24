---
id: ADR-014
title: Payment Integration - Stripe
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Payment Integration - Stripe

## Status

Accepted

## Context

Lumora ERP needs to process payments from customers (invoice payments) and to vendors (bill payments). The payment system must be secure, PCI-compliant, and support multiple payment methods.

## Decision

Use Stripe v22.3.2 for payment processing.

### Configuration

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30',
});
```

### Payment Intent Pattern

```typescript
export async function createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
  });
}
```

### Webhook Handling

```typescript
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }
}
```

## Consequences

### Positive

- Industry standard for online payments
- Excellent API and documentation
- Built-in fraud detection (Stripe Radar)
- Supports multiple payment methods (cards, bank transfers, wallets)
- PCI Level 1 compliant

### Negative

- Transaction fees (2.9% + 30¢ per transaction)
- Stripe lock-in for payment processing
- Webhook complexity for async events

### Risks

- Stripe account freezes (rare but possible)
- API version upgrades may require code changes

## Alternatives Considered

### PayPal

**Pros:** Widely recognized, consumer trust.

**Cons:** Higher fees, less developer-friendly API, complex integration.

### Square

**Pros:** Good for in-person payments.

**Cons:** Less online-focused, higher pricing for online transactions.

### Adyen

**Pros:** Global coverage, enterprise features.

**Cons:** Complex setup, enterprise pricing, overkill for SMB ERP.

## Related ADRs

- ADR-001: Technology Stack
- ADR-003: Backend Framework
- ADR-011: Event-Driven Communication

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
