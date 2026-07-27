import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const report = await procApi.receivingReports.get(params.id);
    return { report };
  } catch {
    return { report: null };
  }
};
