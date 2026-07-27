import { fail } from '@sveltejs/kit';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const leaveType = await hrApi.leaveTypes.get(params.id);
		return { leaveType };
	} catch {
		return { leaveType: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await hrApi.leaveTypes.delete(params.id);
			return { success: true };
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to delete leave type';
			return fail(400, { error: msg });
		}
	},
};
