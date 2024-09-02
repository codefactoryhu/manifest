import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import {
	getAccountName,
	getAccessTokenValidation,
	getRefreshTokenValue,
	whoami,
	schemas
} from '$lib/api/requests';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		// Handle Init Client:
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const accountName: string | null = getAccountName(secureOneCookie!);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		try {
			const whoAmI: schemas.WhoAmiResponse = await clientContext(whoami());
			return { success: true, result: whoAmI };
		} catch (err) {
			return { success: false, error: 'Invalid token or no token provided' };
		}
	}
}
