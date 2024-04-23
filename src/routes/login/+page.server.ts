import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getCookieFormat } from '$lib/api/requests';
import type { Actions, PageServerLoad } from './$types.js';
import { authRequest, loginRequest } from '$lib/api/client.js';

export const load: PageServerLoad = ({ cookies }) => {
	if (cookies.get('accessToken')) {
		redirect(303, `/`);
	}
};

export const actions: Actions = {
	// Handle Login form:
	login: async ({ request, cookies }) => {
		const httpSecure = env.COOKIE_HTTP_SECURE;

		if (httpSecure === undefined) {
			console.error('error: COOKIE_HTTP_SECURE value is not set.');
			error(500);
		}

		const body = Object.fromEntries(await request.formData());
		const account = body.account?.toString();
		const userid = body.userid?.toString();
		const password = body.password?.toString();

		const refreshToken = await loginRequest(account!, userid!, password!);
		const accessToken = await authRequest(refreshToken, account, userid);
		const cookieFormat = getCookieFormat(accessToken, account, userid);

		if (cookieFormat) {
			const base64 = btoa(JSON.stringify(cookieFormat));
			cookies.set('accessToken', base64, {
				httpOnly: true,
				sameSite: 'strict',
				secure: httpSecure === 'true' ? true : false,
				path: '/',
				maxAge: 60 * 8 // valid for 8 minutes
			});
		}
		redirect(307, '/');
	}
};
