import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/api';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return fail(400, { error: data.message || 'Invalid credentials' });
      }

      if (data.sessionToken) {
        cookies.set('better-auth.session_token', data.sessionToken, {
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return redirect(303, '/dashboard');
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
