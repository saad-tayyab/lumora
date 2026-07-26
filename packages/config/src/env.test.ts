import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

describe('env schema', () => {
  it('should accept valid environment', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'a'.repeat(32),
      BETTER_AUTH_URL: 'http://localhost:3000',
      NODE_ENV: 'development',
    });
    expect(result.success).toBe(true);
  });

  it('should default NODE_ENV to development', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'a'.repeat(32),
    });
    expect(result.NODE_ENV).toBe('development');
  });

  it('should default BETTER_AUTH_URL to localhost:3000', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'a'.repeat(32),
    });
    expect(result.BETTER_AUTH_URL).toBe('http://localhost:3000');
  });

  it('should reject short BETTER_AUTH_SECRET', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid DATABASE_URL', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'not-a-url',
      BETTER_AUTH_SECRET: 'a'.repeat(32),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid NODE_ENV', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'a'.repeat(32),
      NODE_ENV: 'staging',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid NODE_ENV values', () => {
    for (const env of ['development', 'production', 'test']) {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
        NODE_ENV: env,
      });
      expect(result.success).toBe(true);
    }
  });
});
