import { apApi } from '$lib/api/ap';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [vendors, bills, pendingBills, payments] = await Promise.all([
      apApi.vendors.list({ limit: 1 }),
      apApi.bills.list({ limit: 1 }),
      apApi.bills.list({ limit: 1, status: 'pending_approval' }),
      apApi.payments.list({ limit: 1 }),
    ]);

    const [recentBills, recentPayments] = await Promise.all([
      apApi.bills.list({ limit: 5 }),
      apApi.payments.list({ limit: 5 }),
    ]);

    return {
      vendorCount: vendors.total,
      billCount: bills.total,
      pendingApprovalCount: pendingBills.total,
      paymentCount: payments.total,
      recentBills: recentBills.data,
      recentPayments: recentPayments.data,
    };
  } catch {
    return {
      vendorCount: 0,
      billCount: 0,
      pendingApprovalCount: 0,
      paymentCount: 0,
      recentBills: [],
      recentPayments: [],
    };
  }
};
