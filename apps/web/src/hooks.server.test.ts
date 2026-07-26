import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from './hooks.server';
import { getSession } from '@lumora/auth/middleware';

vi.mock('@lumora/auth/middleware', () => ({
  getSession: vi.fn(),
}));

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

    expect(getSession).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it('allows public route /register through without session check', async () => {
    const event = createEvent('/register');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(getSession).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it('allows public route /api/auth through without session check', async () => {
    const event = createEvent('/api/auth/callback');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(getSession).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it('redirects unauthenticated users to /login', async () => {
    vi.mocked(getSession).mockResolvedValue(null as any);
    const event = createEvent('/dashboard');
    const resolve = createResolve();

    await expect(handle({ event, resolve })).rejects.toThrow('Redirect to /login');

    expect(getSession).toHaveBeenCalledWith(event.request.headers);
  });

  it('sets locals.user, locals.userId, and locals.tenantId from session', async () => {
    const mockSession = {
      user: { id: 'u1', email: 'test@test.com', name: 'Test', username: 'test' },
      userId: 'u1',
      tenantId: 't1',
    };
    vi.mocked(getSession).mockResolvedValue(mockSession as any);
    const event = createEvent('/dashboard');
    const resolve = createResolve();

    await handle({ event, resolve });

    expect(event.locals.user).toEqual(mockSession.user);
    expect(event.locals.userId).toBe('u1');
    expect(event.locals.tenantId).toBe('t1');
  });

  it('resolves the event after successful session check', async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: 'u1' },
      userId: 'u1',
      tenantId: 't1',
    } as any);
    const event = createEvent('/invoices');
    const resolve = createResolve();

    const response = await handle({ event, resolve });

    expect(resolve).toHaveBeenCalledWith(event);
    expect(response).toBeInstanceOf(Response);
  });

  it('redirects to /login when getSession throws a non-redirect error', async () => {
    vi.mocked(getSession).mockRejectedValue(new Error('network failure'));
    const event = createEvent('/reports');
    const resolve = createResolve();

    await expect(handle({ event, resolve })).rejects.toThrow('Redirect to /login');
  });

  it('re-throws redirect errors from getSession without overriding', async () => {
    const redirectError = new Error('Redirect to /expired');
    (redirectError as any).status = 302;
    (redirectError as any).location = '/expired';
    vi.mocked(getSession).mockRejectedValue(redirectError);
    const event = createEvent('/settings');
    const resolve = createResolve();

    await expect(handle({ event, resolve })).rejects.toThrow('Redirect to /expired');
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
