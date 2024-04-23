import {
	getAccessTokenValidation,
	getAccountName,
	getTimeLeftValue,
	getUserId
} from '$lib/api/requests';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	const accessTokenCookie = cookies.get('accessToken');
	if (accessTokenCookie == undefined) {
		throw redirect(303, `/login`);
	} else {
		const isValid: boolean | null = getAccessTokenValidation(accessTokenCookie);
		if (!isValid || isValid == null) {
			throw redirect(303, `/login`);
		}

		const account: string | null = getAccountName(accessTokenCookie);
		const userid: string | null = getUserId(accessTokenCookie);
		const countdown: number = getTimeLeftValue(accessTokenCookie);

		if (account == null || userid == null) {
			error(500);
		}

		return {
			countdown: countdown,
			account: account,
			userid: userid
		};
	}
}
