import { createClientSender } from '$lib/api/client';
import {
	resource,
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue
} from '$lib/api/requests';
import { getResourceKindFromId } from '$lib/api/requests/utils';
import WebserviceResource from '$lib/api/webservicesResources.js';
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
		const pageResourceKind = schemas.ResourceKind.Webservice;
		const resourceId = params.id;
		const resourceToShow = await send(resource(pageResourceKind, resourceId));
		const webServicesFormat = new WebserviceResource(resourceToShow);

		// Handle Parent:
		const parentKind = webServicesFormat.parentKind!;
		const parentIdentifier = webServicesFormat.parentIdentifier;
		const parentPolicy =
			parentKind !== undefined ? await send(resource(parentKind, parentIdentifier!)) : null;

		// Handle Owner:
		const ownerKind = getResourceKindFromId(webServicesFormat.owner);
		const ownerIdentifier = webServicesFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		return {
			success: true,
			resource: resourceToShow,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy
		};
	}
}
