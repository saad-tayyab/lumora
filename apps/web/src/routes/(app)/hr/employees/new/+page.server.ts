import { hrApi } from '$lib/api/hr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [deptRes, desigRes] = await Promise.all([
      hrApi.departments.list({ limit: 100 }),
      hrApi.designations.list({ limit: 100 }),
    ]);
    return { departments: deptRes.data, designations: desigRes.data };
  } catch {
    return { departments: [], designations: [] };
  }
};
