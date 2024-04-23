import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ cookies }) {
	// URL Guard
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		// Delete accessToken
		cookies.delete('accessToken', { path: '/' });

		// then Redirect to Login
		throw redirect(303, `/login`);
	}
}
