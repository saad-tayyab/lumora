import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockCreateAuthClient = vi.fn(() => ({
  signIn: 'signIn',
  signUp: 'signUp',
  signOut: 'signOut',
  useSession: 'useSession',
}));

vi.mock('better-auth/client', () => ({
  createAuthClient: mockCreateAuthClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('authClient', () => {
  it('should create client with BETTER_AUTH_URL env', async () => {
    process.env.BETTER_AUTH_URL = 'https://auth.example.com';
    const { authClient } = await import('./client');
    expect(mockCreateAuthClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://auth.example.com' }),
    );
    delete process.env.BETTER_AUTH_URL;
  });

  it('should default to localhost:3000 when env not set', async () => {
    delete process.env.BETTER_AUTH_URL;
    const { authClient } = await import('./client');
    expect(mockCreateAuthClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'http://localhost:3000' }),
    );
  });

  it('should export signIn, signUp, signOut, useSession', async () => {
    const { signIn, signUp, signOut, useSession } = await import('./client');
    expect(signIn).toBeDefined();
    expect(signUp).toBeDefined();
    expect(signOut).toBeDefined();
    expect(useSession).toBeDefined();
  });
});
