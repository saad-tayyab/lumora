import { fail } from '@sveltejs/kit';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const designation = await hrApi.designations.get(params.id);
		return { designation };
	} catch {
		return { designation: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await hrApi.designations.delete(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete designation';
			return fail(400, { error: message });
		}
	},
};
