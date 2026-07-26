import * as authApi from '$lib/api/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const user = await authApi.getUser(params.id);
    return { user };
  } catch {
    return { user: null };
  }
};
