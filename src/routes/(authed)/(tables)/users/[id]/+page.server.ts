import { createClientSender } from '$lib/api/client';
import {
	resource,
	schemas,
	showRoleMembers,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue
} from '$lib/api/requests';
import { getResourceKindFromId } from '$lib/api/requests/utils';
import UserResource from '$lib/api/userResources.js';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie = cookies.get('accessToken');
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie!);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Handle Client:
		const account = getAccountName(secureOneCookie!);
		const accessToken = getRefreshTokenValue(secureOneCookie);
		const send = createClientSender(account!, accessToken!);

		// Handle main resource:
		const resourceId = params.id;
		const resourceToShow = await send(resource(schemas.ResourceKind.User, resourceId));
		const userFormat = new UserResource(resourceToShow);

		// Handle Owner:
		const ownerKind = getResourceKindFromId(userFormat.owner);
		const ownerIdentifier = userFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		// Handle Roles:
		const userIdentifier = userFormat.identifier;
		const roleMemberships = send(showRoleMembers(schemas.ResourceKind.User, userIdentifier));

		return {
			success: true,
			resource: resourceToShow,
			owner: ownerByPolicyOwnerIdentifier,
			roleMemberships: roleMemberships!
		};
	}
}
