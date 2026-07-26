import { getSession } from '@lumora/auth/middleware';
import { type Handle, redirect } from '@sveltejs/kit';

const publicRoutes = ['/login', '/register', '/api/auth'];

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return resolve(event);
  }

  try {
    const session = await getSession(event.request.headers);
    if (!session) throw redirect(303, '/login');

    event.locals.user = session.user as App.Locals['user'];
    event.locals.userId = session.userId;
    event.locals.tenantId = session.tenantId;
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw redirect(303, '/login');
  }

  return resolve(event);
};
