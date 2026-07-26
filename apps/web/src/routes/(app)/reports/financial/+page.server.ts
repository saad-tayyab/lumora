import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const [accounts, journalEntries] = await Promise.allSettled([
      api.get<{ data: any[]; total: number }>('/accounts?limit=200'),
      api.get<{ data: any[]; total: number }>('/journal-entries?limit=50'),
    ]);
    return {
      accounts:
        accounts.status === 'fulfilled' ? accounts.value.data || [] : ([] as any[]),
      journalEntries:
        journalEntries.status === 'fulfilled' ? journalEntries.value.data || [] : ([] as any[]),
    };
  } catch {
    return { accounts: [] as any[], journalEntries: [] as any[] };
  }
};
