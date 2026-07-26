import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from './hooks.server';

const mockRedirect = vi.hoisted(() =>
  vi.fn((_status: number, location: string) => {
    const err = new Error(`Redirect to ${location}`);
    (err as any).status = 303;
    (err as any).location = location;
    return err;
  }),
);

vi.mock('@sveltejs/kit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sveltejs/kit')>();
  return {
    ...actual,
    redirect: mockRedirect,
  };
});

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createEvent(pathname: string, headers: Record<string, string> = {}) {
  const request = new Request('http://localhost' + pathname, { headers });
  return {
    request,
    url: new URL('http://localhost' + pathname),
    locals: {} as App.Locals,
  } as Parameters<typeof handle>[0]['event'];
}

function createResolve() {
  return vi.fn(async (event: any) => new Response(`resolved:${event.url.pathname}`));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hooks.server handle', () => {
  it('allows public route /login through without session check', async () => {
    const event = createEvent('/login');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it('allows public route /register through without session check', async () => {
    const event = createEvent('/register');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it('allows public route /api/auth through without session check', async () => {
    const event = createEvent('/api/auth/callback');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it('redirects unauthenticated users to /login', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const event = createEvent('/dashboard');
    const resolve = createResolve();

    await expect(handle({ event, resolve })).rejects.toThrow('Redirect to /login');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/session',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer session',
        }),
      }),
    );
  });

  it('sets locals.user, locals.userId, and locals.tenantId from session', async () => {
    const mockUser = { id: 'u1', email: 'test@test.com', name: 'Test', username: 'test', tenantId: 't1' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });
    const event = createEvent('/dashboard');
    const resolve = createResolve();

    await handle({ event, resolve });

    expect(event.locals.user).toEqual({
      id: 'u1',
      email: 'test@test.com',
      name: 'Test',
      username: 'test',
      status: 'active',
      emailVerified: false,
      mfaEnabled: false,
      tenantId: 't1',
    });
    expect(event.locals.userId).toBe('u1');
    expect(event.locals.tenantId).toBe('t1');
  });

  it('resolves the event after successful session check', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: 'u1', tenantId: 't1' } }),
    });
    const event = createEvent('/invoices');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(resolve).toHaveBeenCalledWith(event);
    expect(response).toBeInstanceOf(Response);
  });

  it('redirects to /login when fetch throws a non-redirect error', async () => {
    mockFetch.mockRejectedValue(new Error('network failure'));
    const event = createEvent('/reports');
    const resolve = createResolve();

    await expect(handle({ event, resolve })).rejects.toThrow('Redirect to /login');
  });

  it('re-throws redirect errors from fetch without overriding', async () => {
    const redirectError = new Error('Redirect to /expired');
    (redirectError as any).status = 302;
    (redirectError as any).location = '/expired';
    mockFetch.mockRejectedValue(redirectError);
    const event = createEvent('/settings');
    const resolve = createResolve();

    await expect(handle({ event, resolve })).rejects.toThrow('Redirect to /expired');
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
