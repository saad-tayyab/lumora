import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const data = await api.get<{ data: unknown[]; total: number }>(
      `/ar/payments?limit=${limit}&offset=${offset}`,
    );
    return { payments: data.data, total: data.total, limit, offset };
  } catch {
    return { payments: [], total: 0, limit, offset };
  }
};
