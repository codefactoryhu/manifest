import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import {
	getMainResourceBasedOnKindAndId,
	getOwnerByPolicyOwnerIdentifierAndOwnerKind,
	getOwnerIdentifierBasedOnThisResource,
	getOwnerKindBasedonThisResource,
	getRoleMembersByIdentifier,
} from '$lib/api/requests/utils';

import {
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue
} from '$lib/api/requests';
import UserResource from '$lib/api/userResources.js';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie: string | undefined = cookies.get('accessToken');
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie!);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Handle Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		// DefineResourceKind and GetResourceId
		const pageResourceKind: schemas.ResourceKind = schemas.ResourceKind.User;
		const resourceId: string = params.id;

		// Handle main resource:
		const mainResource: schemas.ResourceResponse | null = await getMainResourceBasedOnKindAndId(
			pageResourceKind,
			resourceId,
			clientContext
		);

		const thisPageKindResource: UserResource | null =
			mainResource !== null ? new UserResource(mainResource) : null;

		// Handle Owners:
		const ownerKind: schemas.ResourceKind | null =
			getOwnerKindBasedonThisResource(thisPageKindResource);
		const ownerIdentifier: string | null =
			getOwnerIdentifierBasedOnThisResource(thisPageKindResource);
		const ownerByPolicyOwnerIdentifier: schemas.ResourceResponse | null =
			await getOwnerByPolicyOwnerIdentifierAndOwnerKind(ownerKind, ownerIdentifier, clientContext);

		// Handle Roles:
		const userIdentifier: string | null =
			getOwnerIdentifierBasedOnThisResource(thisPageKindResource);
		const roleMembers: Promise<schemas.RoleMemberResponse[]> | null = getRoleMembersByIdentifier(
			userIdentifier,
			pageResourceKind,
			clientContext
		);

		return {
			success: true,
			resource: mainResource,
			owner: ownerByPolicyOwnerIdentifier,
			roleMembers: roleMembers!
		};
	}
}
