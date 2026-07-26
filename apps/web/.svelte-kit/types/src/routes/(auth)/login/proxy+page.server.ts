// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request }: import('./$types').RequestEvent) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    try {
      const res = await fetch('http://localhost:4000/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Invalid credentials' }));
        return fail(400, { error: error.message || 'Invalid credentials' });
      }

      return redirect(303, '/dashboard');
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
;null as any as Actions;