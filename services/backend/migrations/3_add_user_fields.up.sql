-- Add additional fields to BetterAuth user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "tenantId" varchar(255) NOT NULL DEFAULT 'default';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" varchar(50) DEFAULT '';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'active';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "mfaEnabled" boolean NOT NULL DEFAULT false;
