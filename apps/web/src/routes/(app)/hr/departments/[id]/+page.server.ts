import { fail } from '@sveltejs/kit';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const department = await hrApi.departments.get(params.id);
		return { department };
	} catch {
		return { department: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await hrApi.departments.delete(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete department';
			return fail(400, { error: message });
		}
	},
};
