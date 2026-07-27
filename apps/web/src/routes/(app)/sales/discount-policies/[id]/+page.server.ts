import { fail } from '@sveltejs/kit';
import { salesApi } from '$lib/api/sales';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const policy = await salesApi.discountPolicies.get(params.id);
		return { policy };
	} catch {
		return { policy: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await salesApi.discountPolicies.delete(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete discount policy';
			return fail(400, { error: message });
		}
	},
};
