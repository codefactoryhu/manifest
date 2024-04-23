import { createClientSender } from '$lib/api/client';
import GroupResource from '$lib/api/groupResources.js';
import {
	resource,
	schemas,
	showRoleMembers,
	showRoleMemberships,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue
} from '$lib/api/requests';
import { getResourceKindFromId } from '$lib/api/requests/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie = cookies.get('accessToken')!;
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Init Client:
		const account = getAccountName(secureOneCookie!);
		const accessToken = getRefreshTokenValue(secureOneCookie);
		const send = createClientSender(account!, accessToken!);

		// Handle main resource:
		const pageResourceKind = schemas.ResourceKind.Group;
		const resourceId = params.id;
		const resourceToShow = await send(resource(pageResourceKind, resourceId));
		const groupFormat = new GroupResource(resourceToShow);

		// Handle Parent:
		const parentKind = groupFormat.parentKind!;
		const parentIdentifier = groupFormat.parentIdentifier;
		const parentPolicy =
			parentKind !== undefined ? await send(resource(parentKind, parentIdentifier!)) : null;

		// Handle Owner:
		const ownerKind = getResourceKindFromId(groupFormat.owner);
		const ownerIdentifier = groupFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		// Handle Roles:
		const groupIdentifier = groupFormat.identifier;
		const roleMemberships = send(showRoleMemberships(schemas.ResourceKind.Group, groupIdentifier));
		const roleMembers = send(showRoleMembers(schemas.ResourceKind.Group, groupIdentifier));

		return {
			success: true,
			resource: resourceToShow,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy,
			roleMembers: roleMembers,
			roleMemberships: roleMemberships
		};
	}
}
