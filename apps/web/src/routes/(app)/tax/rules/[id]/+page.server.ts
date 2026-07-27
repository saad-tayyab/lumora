import { fail } from '@sveltejs/kit';
import * as taxApi from '$lib/api/tax';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const rule = await taxApi.getAutoAssignmentRule(params.id);
		return { rule };
	} catch {
		return { rule: null };
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await taxApi.deleteAutoAssignmentRule(params.id);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to delete tax rule';
			return fail(400, { error: message });
		}
	},
};
