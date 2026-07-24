---
id: ADR-013
title: Email Service - Resend
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Email Service - Resend

## Status

Accepted

## Context

Lumora ERP needs to send transactional emails (invoice delivery, password reset, notifications) reliably with good deliverability.

## Decision

Use Resend v6.18.0 for transactional email.

### Configuration

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

### Send Pattern

```typescript
export async function sendInvoiceEmail(to: string, invoice: Invoice, pdfUrl: string) {
  await resend.emails.send({
    from: 'Lumora ERP <invoices@lumora.app>',
    to,
    subject: `Invoice ${invoice.number} - ${formatCurrency(invoice.total)}`,
    html: invoiceTemplate({ invoice, pdfUrl }),
  });
}
```

### Email Templates

```
packages/shared/src/email/
├── templates/
│   ├── invoice.ts
│   ├── payment-received.ts
│   ├── password-reset.ts
│   └── welcome.ts
└── index.ts
```

## Consequences

### Positive

- Developer-friendly API
- Good deliverability
- Built-in analytics
- React email support for template design

### Negative

- Paid service (free tier limited to 100 emails/day)
- Less control than self-hosted solutions

### Risks

- Vendor lock-in (mitigated by standard email APIs)
- Pricing may change at scale

## Alternatives Considered

### SendGrid

**Pros:** Established, good deliverability.

**Cons:** Complex pricing, less modern API, deliverability issues.

### AWS SES

**Pros:** Cheap at scale, AWS integration.

**Cons:** Complex setup, less developer-friendly, AWS lock-in.

### Mailgun

**Pros:** Good API, reliable.

**Cons:** Higher pricing than Resend, older API.

## Related ADRs

- ADR-001: Technology Stack
- ADR-003: Backend Framework

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
