import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env from monorepo root for integration tests
// Encore loads .env automatically in dev, but Vitest needs it explicitly
const envPath = resolve(__dirname, '../../../../.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env file not found — rely on environment variables being set externally
}
