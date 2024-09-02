import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import HostResource from '$lib/api/hostResources.js';
import {
	getMainResourceBasedOnKindAndId,
	getOwnerByPolicyOwnerIdentifierAndOwnerKind,
	getOwnerIdentifierBasedOnThisResource,
	getOwnerKindBasedonThisResource,
	getParentIdentifierBasedonThisResource,
	getParentKindBasedonThisResource,
	getParentPolicyBasedonParentKindAndParentIdentifier
} from '$lib/api/requests/utils';
import {
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	schemas
} from '$lib/api/requests';

import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Init Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		// DefineResourceKind and GetResourceId
		const pageResourceKind: schemas.ResourceKind = schemas.ResourceKind.Host;
		const resourceId: string = params.id;

		// Handle main resource:
		const mainResource: schemas.ResourceResponse | null = await getMainResourceBasedOnKindAndId(
			pageResourceKind,
			resourceId,
			clientContext
		);
		
		const thisPageKindResource: HostResource | null =
		mainResource !== null ? new HostResource(mainResource) : null;

		// Handle Parents:
		const parentKind: schemas.ResourceKind | null =
			getParentKindBasedonThisResource(thisPageKindResource);
		const parentIdentifier: string | null =
			getParentIdentifierBasedonThisResource(thisPageKindResource);
		const parentPolicy: schemas.ResourceResponse | null =
			await getParentPolicyBasedonParentKindAndParentIdentifier(
				parentKind,
				parentIdentifier,
				clientContext
			);

		// Handle Owners:
		const ownerKind: schemas.ResourceKind | null =
			getOwnerKindBasedonThisResource(thisPageKindResource);
		const ownerIdentifier: string | null =
			getOwnerIdentifierBasedOnThisResource(thisPageKindResource);
		const ownerByPolicyOwnerIdentifier: schemas.ResourceResponse | null =
			await getOwnerByPolicyOwnerIdentifierAndOwnerKind(ownerKind, ownerIdentifier, clientContext);

		return {
			resource: mainResource,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy
		};
	}
}
