import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { ClientRequest } from './client_types';
import { ClientHttpError } from './errors';

const conjurUrl = env.CONJUR_API_URL ? new URL(env.CONJUR_API_URL) : undefined;
const conjurAuthn = env.CONJUR_AUTHN ? env.CONJUR_AUTHN : 'authn';

export function createClientSender(account: string, accessToken: string) {
	if (conjurUrl === undefined) {
		console.error('error: CONJUR_API_URL is not set.');
		error(500);
	}
	return async function send<T>(callback: ClientRequest<T>) {
		return await callback({
			host: conjurUrl,
			token: accessToken,
			account: account
		});
	};
}

/*  Handle Authentication Proccess */
export async function loginRequest(
	account: string,
	userid: string,
	password: string
): Promise<string> {
	if (account === '' || userid === '' || password === '') {
		throw new ClientHttpError(500, 'Authentication parameters is missing');
	}

	if (conjurUrl === undefined) {
		console.error('error: CONJUR_API_URL is not set.');
		error(500);
	}

	const loginUrl = new URL(`/${conjurAuthn}/${account}/login`, conjurUrl);
	let res: Response;
	try {
		res = await fetch(loginUrl, {
			method: 'GET',
			headers: {
				Authorization: 'Basic ' + btoa(`${userid}:${password}`)
			}
		});
	} catch (err) {
		throw new ClientHttpError(500);
	}

	if (!res.ok) {
		throw new ClientHttpError(res.status);
	}
	const apiKey = await res.text();

	return apiKey;
}

export async function authRequest(
	apiKey: string,
	account: string,
	userid: string
): Promise<string | null> {
	const authUrl = new URL(`/${conjurAuthn}/${account}/${userid}/authenticate`, conjurUrl);
	let res: Response;

	if (conjurUrl === undefined) {
		console.error('error: CONJUR_API_URL is not set.');
		error(500);
	}

	try {
		res = await fetch(authUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain'
			},
			body: apiKey
		});
	} catch (err) {
		throw new ClientHttpError(500);
	}
	if (!res.ok) {
		throw new ClientHttpError(res.status);
	}

	const accessToken: string = await res.json();

	return accessToken ? accessToken : null;
}
