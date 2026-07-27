import { fail } from '@sveltejs/kit';
import * as taxApi from '$lib/api/tax';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const rate = await taxApi.getTaxRate(params.id);
		return { rate };
	} catch {
		return { rate: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await taxApi.deleteTaxRate(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete tax rate';
			return fail(400, { error: message });
		}
	},
};
