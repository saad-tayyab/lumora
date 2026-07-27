import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const status = url.searchParams.get('status') || undefined;

  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) params.set('status', status);

    const data = await api.get<{ data: unknown[]; total: number }>(
      `/ar/credit-notes?${params}`,
    );
    return { creditNotes: data.data, total: data.total, limit, offset };
  } catch {
    return { creditNotes: [], total: 0, limit, offset };
  }
};
