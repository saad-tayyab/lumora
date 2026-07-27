import { fail } from '@sveltejs/kit';
import { getRole, deleteRole } from '$lib/api/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const role = await getRole(params.id);
		return { role };
	} catch {
		return { role: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await deleteRole(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete role';
			return fail(400, { error: message });
		}
	},
};
