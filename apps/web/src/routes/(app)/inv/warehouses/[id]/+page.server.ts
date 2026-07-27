import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const warehouse = await invApi.warehouses.get(params.id);
		return { warehouse };
	} catch {
		return { warehouse: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await invApi.warehouses.delete(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete warehouse';
			return fail(400, { error: message });
		}
	},
};
