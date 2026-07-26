import type { PageServerLoad } from './$types';

const BASE_URL = 'http://localhost:4000';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const res = await fetch(`${BASE_URL}/ar/payments?limit=${limit}&offset=${offset}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch payments');
    const data = await res.json();
    return { payments: data.data, total: data.total, limit, offset };
  } catch {
    return { payments: [], total: 0, limit, offset };
  }
};
