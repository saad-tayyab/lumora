import { invApi } from '$lib/api/inv';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [itemsResult, warehousesResult, categoriesResult, movementsResult, lowStock] =
      await Promise.all([
        invApi.items.list({ limit: 1 }),
        invApi.warehouses.list({ limit: 1 }),
        invApi.categories.list({ limit: 1 }),
        invApi.stockMovements.list({ limit: 1 }),
        invApi.stockLevels.listAll(),
      ]);

    const recentItems = await invApi.items.list({ limit: 5 });

    const lowStockItems = lowStock.filter(
      (s) => s.availableQuantity && parseFloat(s.availableQuantity) <= 10,
    );

    return {
      itemCount: itemsResult.total,
      warehouseCount: warehousesResult.total,
      categoryCount: categoriesResult.total,
      movementCount: movementsResult.total,
      recentItems: recentItems.data,
      lowStockItems,
    };
  } catch {
    return {
      itemCount: 0,
      warehouseCount: 0,
      categoryCount: 0,
      movementCount: 0,
      recentItems: [],
      lowStockItems: [],
    };
  }
};
