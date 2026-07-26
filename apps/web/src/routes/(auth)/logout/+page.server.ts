import { redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/api';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const cookie = cookies.get('better-auth.session_token') || '';

    try {
      await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: { Cookie: `better-auth.session_token=${cookie}` },
      });
    } catch {
      // Continue with logout even if backend call fails
    }

    cookies.delete('better-auth.session_token', { path: '/' });
    throw redirect(303, '/login');
  },
};
