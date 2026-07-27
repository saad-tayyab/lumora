import { type Handle, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/api';
import { cookieStore } from '$lib/cookie-context';

const publicRoutes = ['/login', '/register', '/api/auth'];

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return resolve(event);
  }

  try {
    const cookie = event.request.headers.get('cookie') || '';
    const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
      headers: { cookie, Authorization: 'Bearer session' },
    });

    if (!res.ok) throw redirect(303, '/login');

    const data = await res.json();
    if (!data?.user) throw redirect(303, '/login');

    event.locals.user = {
      id: data.user.id || '',
      email: data.user.email || '',
      name: data.user.name || '',
      username: data.user.username || '',
      status: data.user.status || 'active',
      emailVerified: data.user.emailVerified || false,
      mfaEnabled: data.user.mfaEnabled || false,
      tenantId: data.user.tenantId || 'default',
    };
    event.locals.userId = data.user.id;
    event.locals.tenantId = data.user.tenantId || 'default';

    return cookieStore.run(cookie, () => resolve(event));
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw redirect(303, '/login');
  }
};
