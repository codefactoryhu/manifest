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
import type { RoleMembershipsRequestResponse } from '$lib/api/requests/schemas';
import type { ClientRequest } from '$lib/api/client_types';

export async function load({ cookies }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		if (accessToken == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Init Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		// Get Resources:
		const whoAmI: schemas.WhoAmiResponse = await clientContext(whoami());
		const users: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.User)
		);
		const hosts: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.Host)
		);
		const layers: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.Layer)
		);
		const groups: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.Group)
		);
		const policies: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.Policy)
		);
		const variables: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.Variable)
		);
		const webservices: schemas.ResourceResponse[] = await clientContext(
			resourceKindList(schemas.ResourceKind.Webservice)
		);

		const variableIds: string[] = variables
			.map((resource) => (resource.secrets && resource.secrets.length > 0 ? resource.id : ''))
			.filter((resourceId) => resourceId);

		const secrets: Promise<Record<string, string>> | null =
			variableIds.length > 0 ? clientContext(batchRetrievalSecret(variableIds.join(','))) : null;

		const userid: string | null = getUserId(secureOneCookie!);

		const roleMemberships: RoleMembershipsRequestResponse = await clientContext(
			showRoleMemberships(schemas.ResourceKind.User, userid!)
		);

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
