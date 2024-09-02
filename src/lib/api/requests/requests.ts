import { ClientHttpError } from '../errors';
import { type ClientRequest, type ClientRequestParams } from '../client_types';
import type {
	WhoAmiResponse,
	ResourceKind,
	ResourceResponse,
	ResourceQueryParams,
	ResourceKindListQueryParams,
	ResourceCountResponse,
	RoleMemberResponse,
	RoleMembershipsBodyResponse,
	ATformat,
	IAccessToken,
	ITokenPayload,
	RoleMembershipsRequestResponse
} from './schemas';
import { createYAMLContent } from './utils';
import { error } from '@sveltejs/kit';

export const whoami = () => {
	return async ({ host, token }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL('/whoami', host);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch {
			throw new ClientHttpError(500);
		}
		if (res.ok) {
			const body = (await res.json()) as WhoAmiResponse;
			return body;
		}
		throw new ClientHttpError(res.status, await res.text());
	};
};

export const resourceKindList = (kind: ResourceKind, queryParams?: ResourceKindListQueryParams) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/resources/${account}/${kind}`, host);
		if (queryParams?.search) {
			url.searchParams.set('search', queryParams.search);
		}
		if (queryParams?.limit) {
			url.searchParams.set('limit', queryParams.limit.toString());
		}
		if (queryParams?.offset) {
			url.searchParams.set('offset', queryParams.offset.toString());
		}
		if (queryParams?.acting_as) {
			url.searchParams.set('acting_as', queryParams.acting_as);
		}

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		const res = await fetch(url, opts);

		if (res.ok || res.status === 422) {
			const body = (await res.json()) as ResourceResponse[];
			return body;
		}

		throw new ClientHttpError(res.status);
	};
};

export const resourceKindListCount = (kind: ResourceKind) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		/** When count is true at query, return only the number of items in the list. */
		const url = new URL(`/resources/${account}/${kind}?count=true`, host);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		const res = await fetch(url, opts);

		if (res.ok || res.status === 422) {
			const body = (await res.json()) as ResourceCountResponse;
			return body;
		}

		throw new ClientHttpError(res.status);
	};
};

export const getResourceByKindAndIdentifier = (
	kind: ResourceKind,
	id: string,
	queryParams?: ResourceQueryParams
) => {
	return async ({
		host,
		token,
		account
	}: ClientRequestParams): Promise<ResourceResponse | null> => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/resources/${account}/${kind}/${id}`, host);
		if (queryParams?.permitted_roles) {
			url.searchParams.set('kind', queryParams.permitted_roles.toString());
		}
		if (queryParams?.privilege) {
			url.searchParams.set('search', queryParams.privilege);
		}
		if (queryParams?.check) {
			url.searchParams.set('limit', queryParams.check.toString());
		}
		if (queryParams?.role) {
			url.searchParams.set('offset', queryParams.role);
		}

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500, 'Network error or server is unavailable.');
		}

		const awaitedResponse = await res.json();

		if (res.ok) {
			return awaitedResponse as ResourceResponse;
		}

		switch (res.status) {
			case 401:
				console.error(
					`The request lacks valid authentication credentials. ${awaitedResponse.error.message}.`
				);
				return null;
			case 403:
				console.error(
					`The authenticated user lacks the necessary privilege. ${awaitedResponse.error.message}.`
				);
				return null;
			case 404:
				console.error(
					`The requested resource does not exist, or the authenticated user lacks the necessary privilege. ${awaitedResponse.error.message}.`
				);
				return null;
			default:
				console.error(awaitedResponse.error?.message || 'Unexpected error occurred.');
				return null;
		}
	};
};

export const getResourcesByKindAndParentId = (kind: ResourceKind, search: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/resources/${account}/${kind}`, host);
		if (search) {
			url.searchParams.set('search', search);
		}
		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}

		if (res.ok) {
			return (await res.json()) as ResourceResponse[];
		}

		switch (res.status) {
			case 401:
				console.error(`The request lacks valid authentication credentials.`);
				return null;
			case 403:
				console.error(`The authenticated user lacks the necessary privilege.`);
				return null;
			case 404:
				console.error(
					`The requested resource does not exist, or authenticated user lacks the necessary privilege.`
				);
				return null;
			default:
				console.error('Unexpected error occurred.');
				return null;
		}
	};
};

export const loadPolicy = (identifier: string, yamlContent: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'PATCH' };
		const url = new URL(`/policies/${account}/policy/${identifier}`, host);

		headers.set('Authorization', `Token token="${token}"`);
		headers.set('Content-Type', 'application/yml');

		opts.headers = headers;
		opts.body = yamlContent;

		try {
			return await fetch(url, opts);
		} catch (err) {
			throw new ClientHttpError(500);
		}
	};
};

export const deletePolicy = (identifier: string, yamlContent: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const url = new URL(`/policies/${account}/policy/${identifier}`, host);

		const headers = new Headers({
			Authorization: `Token token="${token}"`,
			'Content-Type': 'application/yml'
		});

		const options: RequestInit = {
			method: 'PATCH',
			headers: headers,
			body: yamlContent
		};

		try {
			return await fetch(url, options);
		} catch (err) {
			throw new ClientHttpError(500);
		}
	};
};

export const retrieveSecret = (kind: ResourceKind, id: string, version?: number) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/secrets/${account}/${kind}/${id}`, host);

		if (version) {
			url.searchParams.set('version', version.toLocaleString());
		}

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}
		if (res.ok) {
			const body = await res.text();
			return body;
		}
		throw new ClientHttpError(res.status, await res.text());
	};
};

export const batchRetrievalSecret = (variableIds: string) => {
	return async ({ host, token }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };

		const url = new URL(`/secrets?variable_ids=${variableIds}`, host);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		// as per Svelte docs, we shouldn't do this with try-catch
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}

		switch (res.status) {
			case 200:
				return await res.json();
			case 401:
				throw new ClientHttpError(401, 'The request lacks valid authentication credentials');
			case 403:
				throw new ClientHttpError(
					403,
					'The authenticated user lacks the necessary privilege for at least one Secret'
				);
			case 404:
				throw new ClientHttpError(
					404,
					'At least one variable does not exist, or at least one variable does not have any secret values'
				);
			case 422:
				throw new ClientHttpError(422, 'A request parameter was missing or invalid');
			default:
				throw new ClientHttpError(res.status, await res.text());
		}
	};
};
export const uploadSecret = (kind: ResourceKind, identifier: string, secretData: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'POST' };
		const url = new URL(`/secrets/${account}/${kind}/${identifier}`, host);

		headers.set('Authorization', `Token token="${token}"`);
		headers.set('Content-Type', 'application/octet-stream');

		opts.headers = headers;
		opts.body = secretData;

		try {
			return await fetch(url, opts);
		} catch (err) {
			throw new ClientHttpError(500);
		}
	};
};

export const checkUserPermission = (
	kind: string,
	identifier: string,
	privilege: string,
	userId: string
) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(
			`/resources/${account}/${kind}/${identifier}?check=true&role=${account}:user:${userId}&privilege=${privilege}`,
			host
		);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}
		if (res.ok) {
			return true;
		} else {
			return false;
		}
	};
};

// List information about the role
export const showRole = (kind: ResourceKind, identifier: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/roles/${account}/${kind}/${identifier}`, host);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}
		if (res.ok) {
			const body = await res.json();
			return body;
		}
		throw new ClientHttpError(res.status, await res.text());
	};
};

// List members within a role.
export const showRoleMembers = (kind: ResourceKind, identifier: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/roles/${account}/${kind}/${identifier}?members`, host);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;

		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}
		if (res.ok) {
			const body = (await res.json()) as RoleMemberResponse[];
			return body;
		}
		throw new ClientHttpError(res.status, await res.text());
	};
};

// Allows you to view the memberships of a role, including a list of groups of which a specific host or user is a member
export const showRoleMemberships = (kind: ResourceKind, identifier: string) => {
	return async ({
		host,
		token,
		account
	}: ClientRequestParams): Promise<RoleMembershipsRequestResponse> => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(`/roles/${account}/${kind}/${identifier}?memberships`, host);
		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}

		if (res.ok) {
			const result = await res.json();
			const body = result as RoleMembershipsBodyResponse[];
			return {
				success: true,
				body: body
			};
		} else {
			return {
				success: false,
				body: []
			};
		}
	};
};

// Lists the roles which have the named permission on a resource.
export const showPermittedRoles = (kind: ResourceKind, identifier: string, privliges: string) => {
	return async ({ host, token, account }: ClientRequestParams) => {
		const headers = new Headers();
		const opts: RequestInit = { method: 'GET' };
		const url = new URL(
			`/resources/${account}/${kind}/${identifier}?permitted_roles=true&privilege=${privliges}`,
			host
		);

		headers.set('Authorization', `Token token="${token}"`);

		opts.headers = headers;

		let res: Response;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new ClientHttpError(500);
		}
		if (res.ok) {
			const body = await res.json();
			return body;
		}
		throw new ClientHttpError(res.status, await res.text());
	};
};

/* Validate Cookie Details */
export function getAccessTokenValidation(value: string): boolean | null {
	try {
		// Decode and format to ATformat
		const decodedData = JSON.parse(atob(value)) as ATformat;

		// Format to IAccessToken
		const tokenObj: IAccessToken = JSON.parse(
			JSON.stringify(decodedData.accessToken)
		) as IAccessToken;

		// Get ITokenPayload
		const payload: ITokenPayload = JSON.parse(atob(tokenObj.payload)) as ITokenPayload;

		const dateNow = new Date();
		const tokenExpirationValue = new Date(Number(payload.exp) * 1000);
		if (tokenExpirationValue > dateNow) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		// Handle the error when JSON parsing fails
		console.error('Invalid AT value. Error at validation!:', error);
		// If something going wrong return NULL
		return null;
	}
}
/* ------------ */

/* Extract Cookie Details */
export function getCookieFormat(accessToken: string, account: string, userid: string): ATformat {
	const accountSession: ATformat = {
		accessToken,
		account,
		userid
	};
	return accountSession;
}

export function getAccountName(value: string) {
	try {
		// Decode and format to ATformat
		const decodedData = JSON.parse(atob(value)) as ATformat;

		// Return account param
		return decodedData.account;
	} catch (error) {
		// Handle the error when JSON parsing fails
		console.error('Invalid AT value - at getting account name!:', error);
		// If something going wrong return NULL
		return null;
	}
}

export function getUserId(value: string) {
	try {
		// Decode and format to ATformat
		const decodedData = JSON.parse(atob(value)) as ATformat;

		// Return userid param
		return decodedData.userid;
	} catch (error) {
		// Handle the error when JSON parsing fails
		console.error('Invalid AT value at user id!:', error);
		// If something going wrong return NULL
		return null;
	}
}

export function getRefreshTokenValue(value: string | undefined) {
	if (value !== undefined) {
		try {
			// Decode and format to ATformat
			const decodedData = JSON.parse(atob(value)) as ATformat;

			// Format to IAccessToken
			const tokenObj: IAccessToken = JSON.parse(
				JSON.stringify(decodedData.accessToken)
			) as IAccessToken;

			const base64Token = btoa(JSON.stringify(tokenObj));
			return base64Token;
		} catch (error) {
			// Handle the error when JSON parsing fails
			console.error('Invalid RT value:', error);
			// If something going wrong return NULL
			return null;
		}
	} else {
		return null;
	}
}

export function getTimeLeftValue(value: string | undefined): number {
	if (value !== undefined) {
		try {
			// Decode and format to ATformat
			const decodedData = JSON.parse(atob(value)) as ATformat;

			// Format to IAccessToken
			const tokenObj: IAccessToken = JSON.parse(
				JSON.stringify(decodedData.accessToken)
			) as IAccessToken;

			// Get ITokenPayload
			const payload: ITokenPayload = JSON.parse(atob(tokenObj.payload)) as ITokenPayload;

			const currentTime = new Date();
			const tokenExpirationValue = new Date(Number(payload.exp) * 1000);

			const timeLeft: number = tokenExpirationValue.getTime() - currentTime.getTime();

			// Check if the cookie has expired
			if (timeLeft <= 0) {
				return 0; // Cookie has expired
			}

			// Convert milliseconds to seconds
			const timeLeftSeconds: number = Math.ceil(timeLeft / 1000);

			return timeLeftSeconds;
		} catch (error) {
			// Handle the error when JSON parsing fails
			console.error('Error at time left calculation:', error);
			// If something going wrong return 0
			return 0;
		}
	} else {
		return 0;
	}
}

export async function getReportOfDeletingEachHostByIds(
	deletableIds: string[],
	clientContext: <T>(callback: ClientRequest<T>) => Promise<T>
): Promise<{
	success: boolean;
	deletedItemsIds: string[];
	notDeletedItems: string[];
	errorAtThisDelete: string[];
}> {
	const deletedItemsIds: string[] = [];
	const errorAtThisDelete: string[] = [];
	const notDeletedItems: string[] = deletableIds;

	for (const item of deletableIds) {
		try {
			const response = await deleteHostById(item, clientContext);
			if (response.success) {
				deletedItemsIds.push(item);
			}
		} catch (err) {
			errorAtThisDelete.push(item);
		}
	}

	const success = deletedItemsIds.length === deletableIds.length;
	return {
		success,
		deletedItemsIds,
		notDeletedItems,
		errorAtThisDelete
	};
}

export async function deleteHostById(
	hostId: string,
	clientContext: <T>(callback: ClientRequest<T>) => Promise<T>
): Promise<{
	success: boolean;
	status: number;
}> {
	const yamlContent: string = createYAMLContent('host', hostId);
	const result = getDeleteRequestResult('root', yamlContent, clientContext);
	return result;
}

export async function getDeleteRequestResult(
	parentPolicy: string,
	yamlContent: string,
	clientContext: <T>(callback: ClientRequest<T>) => Promise<T>
) {
	let response: Response;
	if (yamlContent && yamlContent.length > 1) {
		try {
			response = await clientContext(deletePolicy(parentPolicy, yamlContent));
			return { success: true, status: response.status, additionalInfo: '' };
		} catch (err) {
			error(400);
		}
	} else {
		error(400);
	}
}
