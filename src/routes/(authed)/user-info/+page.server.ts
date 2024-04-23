import { createClientSender } from '$lib/api/client';
import {
	getAccountName,
	getAccessTokenValidation,
	getRefreshTokenValue,
	whoami
} from '$lib/api/requests';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie = cookies.get('accessToken')!;
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		// Handle Init Client:
		const accessToken = getRefreshTokenValue(secureOneCookie);
		const account = getAccountName(secureOneCookie!);
		const send = createClientSender(account!, accessToken!);

		try {
			const whoAmI = await send(whoami());
			return { success: true, result: whoAmI };
		} catch (err) {
			return { success: false, error: 'Invalid token or no token provided' };
		}
	}
}
