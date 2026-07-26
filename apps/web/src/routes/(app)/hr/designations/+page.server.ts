import { hrApi } from '$lib/api/hr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  try {
    const [desigRes, deptRes] = await Promise.all([
      hrApi.designations.list({ limit, offset }),
      hrApi.departments.list({ limit: 100 }),
    ]);
    return { designations: desigRes.data, departments: deptRes.data, total: desigRes.total };
  } catch {
    return { designations: [], departments: [], total: 0 };
  }
};
