import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const payment = await apApi.payments.get(params.id);
		return { payment };
	} catch {
		throw new Response('Payment not found', { status: 404 });
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		try {
			await apApi.payments.delete(params.id);
			return { success: true };
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to delete payment';
			return fail(400, { error: msg });
		}
	},
};
