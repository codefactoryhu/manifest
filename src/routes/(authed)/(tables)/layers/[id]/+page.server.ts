import { createClientSender } from '$lib/api/client';
import LayerResource from '$lib/api/layerResources.js';
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
		const pageResourceKind = schemas.ResourceKind.Layer;
		const resourceId = params.id;
		const resourceToShow = await send(resource(pageResourceKind, resourceId));
		const layersFormat = new LayerResource(resourceToShow);

		// Handle Parent:
		const parentKind = layersFormat.parentKind!;
		const parentIdentifier = layersFormat.parentIdentifier;
		const parentPolicy =
			parentKind !== undefined ? await send(resource(parentKind, parentIdentifier!)) : null;

		// Handle Owner:
		const ownerKind = getResourceKindFromId(layersFormat.owner);
		const ownerIdentifier = layersFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		// Handle Roles:
		const layerIdentifier = layersFormat.identifier;
		const roleMemberships = send(showRoleMemberships(schemas.ResourceKind.Layer, layerIdentifier));
		const roleMembers = send(showRoleMembers(schemas.ResourceKind.Layer, layerIdentifier));

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
