import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const category = await invApi.categories.get(params.id);
		return { category };
	} catch {
		return { category: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await invApi.categories.delete(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete category';
			return fail(400, { error: message });
		}
	},
};
