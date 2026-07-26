import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/api';


export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const status = url.searchParams.get('status') || undefined;
  const customerId = url.searchParams.get('customerId') || undefined;

  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) params.set('status', status);
    if (customerId) params.set('customerId', customerId);

    const res = await fetch(`${BACKEND_URL}/ar/invoices?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    const data = await res.json();
    return { invoices: data.data, total: data.total, limit, offset };
  } catch {
    return { invoices: [], total: 0, limit, offset };
  }
};
