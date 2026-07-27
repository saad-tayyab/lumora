import { financialApi } from '$lib/api/financial';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const fiscalYear = await financialApi.fiscalYears.get(params.id);
		return { fiscalYear };
	} catch {
		return { fiscalYear: null };
	}
};
