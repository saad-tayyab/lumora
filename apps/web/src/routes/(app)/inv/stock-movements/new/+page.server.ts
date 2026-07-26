import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [itemsResult, warehousesResult] = await Promise.all([
      invApi.items.list({ limit: 100 }),
      invApi.warehouses.list({ limit: 100 }),
    ]);
    return {
      items: itemsResult.data,
      warehouses: warehousesResult.data,
    };
  } catch {
    return { items: [], warehouses: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const data = {
      itemId: formData.get('itemId') as string,
      warehouseId: formData.get('warehouseId') as string,
      type: formData.get('type') as 'in' | 'out' | 'transfer' | 'adjustment',
      quantity: formData.get('quantity') as string,
      referenceType: (formData.get('referenceType') as string) || undefined,
      referenceId: (formData.get('referenceId') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    };

    if (!data.itemId || !data.warehouseId || !data.type || !data.quantity) {
      return fail(400, { error: 'Item, warehouse, type, and quantity are required' });
    }

    try {
      await invApi.stockMovements.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to record stock movement';
      return fail(400, { error: message });
    }
  },
};
