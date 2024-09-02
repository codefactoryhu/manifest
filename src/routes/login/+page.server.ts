import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getCookieFormat } from '$lib/api/requests';
import type { Actions, PageServerLoad } from './$types.js';
import { authRequest, loginRequest } from '$lib/api/client.js';
import type { ATformat } from '$lib/api/requests/schemas.js';

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
		const accountName: string | null = body.account?.toString();
		const userid: string = body.userid?.toString();
		const password: string = body.password?.toString();

		const refreshToken: string = await loginRequest(accountName!, userid!, password!);
		const accessToken: string | null = await authRequest(refreshToken, accountName, userid);
		const cookieFormat: ATformat = getCookieFormat(accessToken!, accountName, userid);

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
