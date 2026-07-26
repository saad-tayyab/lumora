import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const categories = await invApi.categories.list({ limit: 100 });
    return { categories: categories.data };
  } catch {
    return { categories: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const data = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      description: (formData.get('description') as string) || undefined,
      categoryId: (formData.get('categoryId') as string) || undefined,
      unitOfMeasure: formData.get('unitOfMeasure') as string,
      costPrice: formData.get('costPrice') as string,
      salePrice: formData.get('salePrice') as string,
      reorderPoint: (formData.get('reorderPoint') as string) || undefined,
    };

    if (!data.name || !data.sku || !data.unitOfMeasure || !data.costPrice || !data.salePrice) {
      return fail(400, {
        error: 'Name, SKU, unit of measure, cost price, and sale price are required',
      });
    }

    try {
      await invApi.items.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create item';
      return fail(400, { error: message });
    }
  },
};
