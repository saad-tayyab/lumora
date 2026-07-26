import { type Handle, redirect } from '@sveltejs/kit';

const publicRoutes = ['/login', '/register', '/api/auth'];
const backendUrl = 'http://localhost:4000';

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return resolve(event);
  }

  try {
    const cookie = event.request.headers.get('cookie') || '';
    const res = await fetch(`${backendUrl}/api/auth/session`, {
      headers: { cookie },
    });

    if (!res.ok) throw redirect(303, '/login');

    const data = await res.json();
    if (!data?.user) throw redirect(303, '/login');

    event.locals.user = data.user as App.Locals['user'];
    event.locals.userId = data.user.id;
    event.locals.tenantId = data.user.tenantId || '';
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw redirect(303, '/login');
  }

  return resolve(event);
};
