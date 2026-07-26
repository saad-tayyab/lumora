import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/api';


export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const status = url.searchParams.get('status') || undefined;

  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) params.set('status', status);

    const res = await fetch(`${BACKEND_URL}/ar/credit-notes?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch credit notes');
    const data = await res.json();
    return { creditNotes: data.data, total: data.total, limit, offset };
  } catch {
    return { creditNotes: [], total: 0, limit, offset };
  }
};
