import { fail, redirect } from '@sveltejs/kit';
import * as budgetApi from '$lib/api/budget';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const result = await budgetApi.listBudgets({ limit: 200 });
    const budgetLines = result.data.flatMap((b) =>
      (b as unknown as { lines?: Array<{ id: string; description: string | null; budgetHeaderId: string }> }).lines?.map((line) => ({
        ...line,
        budgetName: b.name,
      })) ?? [],
    );
    return { budgetLines };
  } catch {
    return { budgetLines: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const budgetLineId = formData.get('budgetLineId') as string;
    const amount = formData.get('amount') as string;
    const consumptionDate = formData.get('consumptionDate') as string;
    const description = formData.get('description') as string;

    if (!budgetLineId) return fail(400, { error: 'Budget line is required' });
    if (!amount || parseFloat(amount) <= 0) return fail(400, { error: 'Valid amount is required' });
    if (!consumptionDate) return fail(400, { error: 'Consumption date is required' });

    try {
      await budgetApi.createBudgetConsumption({
        budgetLineId,
        amount,
        consumptionDate,
        description: description?.trim() || undefined,
      });
      return redirect(303, '/budgets/consumptions');
    } catch {
      return fail(500, { error: 'Failed to create consumption record' });
    }
  },
};
