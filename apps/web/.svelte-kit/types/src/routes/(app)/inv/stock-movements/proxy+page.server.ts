// @ts-nocheck
import { invApi } from '$lib/api/inv';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const itemId = url.searchParams.get('itemId') || undefined;
  const warehouseId = url.searchParams.get('warehouseId') || undefined;

  try {
    const result = await invApi.stockMovements.list({ limit, offset, itemId, warehouseId });
    return { movements: result.data, total: result.total };
  } catch {
    return { movements: [], total: 0 };
  }
};
