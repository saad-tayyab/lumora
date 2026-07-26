// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const [item, categoriesResult] = await Promise.all([
      invApi.items.get(params.id),
      invApi.categories.list({ limit: 100 }),
    ]);
    return { item, categories: categoriesResult.data };
  } catch {
    throw new Response('Item not found', { status: 404 });
  }
};

export const actions = {
  default: async ({ request, params }: import('./$types').RequestEvent) => {
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
      await invApi.items.update(params.id, data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update item';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;