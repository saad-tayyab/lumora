import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const data = await api.get<{ data: unknown[]; total: number }>(
      `/ar/customers?limit=${limit}&offset=${offset}`,
    );
    return { customers: data.data, total: data.total, limit, offset };
  } catch {
    return { customers: [], total: 0, limit, offset };
  }
};
