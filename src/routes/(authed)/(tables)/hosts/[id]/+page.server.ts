import { createClientSender } from '$lib/api/client';
import HostResource from '$lib/api/hostResources.js';
import {
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	resource,
	schemas,
	showRoleMembers
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
		const pageResourceKind = schemas.ResourceKind.Host;
		const resourceId = params.id;
		const resourceToShow = await send(resource(pageResourceKind, resourceId));
		const hostsFormat = new HostResource(resourceToShow);

		// Handle Parent:
		const parentKind = hostsFormat.parentKind!;
		const parentIdentifier = hostsFormat.parentIdentifier;
		const parentPolicy =
			parentKind !== undefined ? await send(resource(parentKind, parentIdentifier!)) : null;

		// Handle Owner:
		const ownerKind = getResourceKindFromId(hostsFormat.owner);
		const ownerIdentifier = hostsFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		// Handle Roles:
		const hostIdentifier = hostsFormat.identifier;
		const roleMemberships = send(showRoleMembers(schemas.ResourceKind.Host, hostIdentifier));

		return {
			success: true,
			resource: resourceToShow,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy,
			roleMemberships: roleMemberships
		};
	}
}
