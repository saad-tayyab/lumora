import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    userId: locals.userId,
    tenantId: locals.tenantId,
  };
};
