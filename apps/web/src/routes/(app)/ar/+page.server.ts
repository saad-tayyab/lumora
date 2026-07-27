import type { PageServerLoad } from './$types';
import { api, type PaginatedResponse } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const [custRes, invRes, payRes, cnRes] = await Promise.allSettled([
      api.get<PaginatedResponse<any>>('/ar/customers?limit=5'),
      api.get<PaginatedResponse<any>>('/ar/invoices?limit=10'),
      api.get<PaginatedResponse<any>>('/ar/payments?limit=5'),
      api.get<PaginatedResponse<any>>('/ar/credit-notes?limit=5'),
    ]);
    return {
      customers: custRes.status === 'fulfilled' ? custRes.value.data || [] : [],
      invoices: invRes.status === 'fulfilled' ? invRes.value.data || [] : [],
      payments: payRes.status === 'fulfilled' ? payRes.value.data || [] : [],
      creditNotes: cnRes.status === 'fulfilled' ? cnRes.value.data || [] : [],
    };
  } catch {
    return { customers: [] as any[], invoices: [] as any[], payments: [] as any[], creditNotes: [] as any[] };
  }
};
