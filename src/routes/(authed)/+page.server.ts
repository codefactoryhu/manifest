import { redirect } from '@sveltejs/kit';
import {
	batchRetrievalSecret,
	resourceKindList,
	schemas,
	showRoleMemberships,
	whoami,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	getUserId
} from '$lib/api/requests';
import { createClientSender } from '$lib/api/client';

export async function load({ cookies }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie = cookies.get('accessToken')!;
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		const accessToken = getRefreshTokenValue(secureOneCookie);
		if (accessToken == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Init Client:
		const account = getAccountName(secureOneCookie!);
		const send = createClientSender(account!, accessToken!);

		// Get Resources:
		const whoAmI = await send(whoami());
		const users = await send(resourceKindList(schemas.ResourceKind.User));
		const hosts = await send(resourceKindList(schemas.ResourceKind.Host));
		const layers = await send(resourceKindList(schemas.ResourceKind.Layer));
		const groups = await send(resourceKindList(schemas.ResourceKind.Group));
		const policies = await send(resourceKindList(schemas.ResourceKind.Policy));
		const variables = await send(resourceKindList(schemas.ResourceKind.Variable));
		const webservices = await send(resourceKindList(schemas.ResourceKind.Webservice));

		const variableIds = variables
			.map((resource) =>
				resource.secrets && resource.secrets.length > 0 ? resource.id : undefined
			)
			.filter((resourceId) => resourceId);

		const secrets =
			variableIds.length > 0 ? await send(batchRetrievalSecret(variableIds.join(','))) : null;

		const userid = getUserId(secureOneCookie!);

		const roleMemberships = await send(showRoleMemberships(schemas.ResourceKind.User, userid!));

		return {
			success: true,
			roleMemberships: roleMemberships,
			users: users,
			hosts: hosts,
			layers: layers,
			groups: groups,
			policies: policies,
			variables: variables,
			webservices: webservices,
			userData: whoAmI,
			variableIds: variableIds,
			secrets: secrets
		};
	}
}
