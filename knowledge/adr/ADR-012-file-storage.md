---
id: ADR-012
title: File Storage - Cloudflare R2
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# File Storage - Cloudflare R2

## Status

Accepted

## Context

Lumora ERP needs to store user-uploaded files (invoices, receipts, documents, avatars) in a scalable, cost-effective object storage solution.

## Decision

Use Cloudflare R2 (S3-compatible) with @aws-sdk/client-s3 v3.1094.0.

### Configuration

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

### Upload Pattern

```typescript
export async function uploadFile(file: File, path: string) {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    Body: file.stream(),
    ContentType: file.type,
  }));
  return `${R2_PUBLIC_URL}/${path}`;
}
```

### Storage Structure

```
r2://lumora-erp/
├── tenants/{tenantId}/
│   ├── invoices/
│   │   └── {invoiceId}/
│   │       └── {filename}
│   ├── receipts/
│   ├── documents/
│   └── avatars/
└── public/
    └── templates/
```

## Consequences

### Positive

- No egress fees (unlike AWS S3)
- S3-compatible API — easy to swap if needed
- Global CDN built-in
- Cost-effective for high-volume storage

### Negative

- Smaller ecosystem than AWS S3
- Less advanced features than S3 (no S3 Select, limited lifecycle policies)

### Risks

- R2 is newer — less battle-tested than S3
- Vendor lock-in risk (mitigated by S3-compatible API)

## Alternatives Considered

### AWS S3

**Pros:** Most mature, feature-rich, largest ecosystem.

**Cons:** Egress fees, more complex pricing, AWS lock-in.

### Google Cloud Storage

**Pros:** Good integration with GCP, competitive pricing.

**Cons:** GCP lock-in, less S3-compatible.

### Supabase Storage

**Pros:** Integrated with Supabase ecosystem.

**Cons:** Vendor lock-in, less control, may conflict with Neon choice.

## Related ADRs

- ADR-001: Technology Stack
- ADR-003: Backend Framework

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
