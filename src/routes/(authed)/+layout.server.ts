import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import {
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	getTimeLeftValue,
	getUserId,
	schemas,
	whoami
} from '$lib/api/requests';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	const secureOneCookie: string | undefined = cookies.get('accessToken');
	if (secureOneCookie == undefined) {
		throw redirect(303, `/login`);
	} else {
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
			throw redirect(303, `/login`);
		}

		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		if (accessToken == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		const accountName: string | null = getAccountName(secureOneCookie);
		const userid: string | null = getUserId(secureOneCookie);
		const countdown: number = getTimeLeftValue(secureOneCookie);

		// Init Client:
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(accountName!, accessToken!);

		const whoAmI: schemas.WhoAmiResponse = await clientContext(whoami());
		const userIsAdmin: boolean = whoAmI.username == 'admin';

		if (accountName == null || userid == null) {
			error(500);
		}

		return {
			countdown: countdown,
			account: accountName,
			userid: userid,
			userIsAdmin: userIsAdmin
		};
	}
}
