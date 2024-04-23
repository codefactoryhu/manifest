import type { BaseResource } from '$lib/api/baseResources';
import { createClientSender } from '$lib/api/client';
import { ClientHttpError } from '$lib/api/errors';
import {
	checkUserPermission,
	resource,
	retrieveSecret,
	schemas,
	uploadSecret,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	getUserId
} from '$lib/api/requests';
import { getResourceKindFromId } from '$lib/api/requests/utils';
import VariableResource from '$lib/api/variableResources.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies, params, depends }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		depends('data:data');
		const secureOneCookie = cookies.get('accessToken');
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie!);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Handle Client:
		const account = getAccountName(secureOneCookie!);
		const accessToken = getRefreshTokenValue(secureOneCookie!);

		const send = createClientSender(account!, accessToken!);

		// Handle main resource:
		const pageResourceKind = schemas.ResourceKind.Variable;
		const resourceId = params.id;
		const resourceToShow = await send(resource(pageResourceKind, resourceId));
		const variableFormat = new VariableResource(resourceToShow);

		// Handle Parent:
		const parentKind = variableFormat.parentKind!;
		const parentIdentifier = variableFormat.parentIdentifier;
		const parentPolicy =
			parentKind !== undefined ? await send(resource(parentKind, parentIdentifier!)) : null;

		// Handle Owner:
		const ownerKind = getResourceKindFromId(variableFormat.owner);
		const ownerIdentifier = variableFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		// Handle User Permissions
		const userid = getUserId(secureOneCookie!);
		const userHasPermissionToFechSecretValue = await send(
			checkUserPermission(
				schemas.ResourceKind.Variable,
				encodeURIComponent(resourceId),
				'execute',
				userid!
			)
		);
		const userHasPermissionToUpdateSecretValue = await send(
			checkUserPermission(
				schemas.ResourceKind.Variable,
				encodeURIComponent(resourceId),
				'update',
				userid!
			)
		);

		// Handle Secrets
		const secretsLength = resourceToShow.secrets ? resourceToShow.secrets.length : 0;
		const hasSecret: boolean = resourceToShow.secrets ? true : false;

		const getSecretsDetails = async (
			hasPermission: boolean,
			resource: BaseResource,
			hasSecret: boolean,
			resourceId: string
		) => {
			if (hasSecret) {
				if (hasPermission && resource.secrets) {
					try {
						const result: Promise<schemas.SecretResponse[]> = Promise.all(
							resource.secrets.map(async (secret) => {
								const value = await send(
									retrieveSecret(schemas.ResourceKind.Variable, resourceId, secret.version)
								);
								return { expires_at: secret.expires_at!, version: secret.version!, value: value };
							})
						);
						return result;
					} catch (error) {
						return Promise.reject(new ClientHttpError(400, 'Bad Request'));
					}
				} else {
					return Promise.reject(new ClientHttpError(401, 'No Permission to fetch Secret values'));
				}
			} else {
				return Promise.reject(new ClientHttpError(404, 'No Secrets'));
			}
		};

		const secrets = await getSecretsDetails(
			userHasPermissionToFechSecretValue,
			variableFormat,
			hasSecret,
			resourceId
		);

		return {
			success: true,
			resourceId: resourceId,
			resource: resourceToShow,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy,
			userHasPermissionToFechSecretValue,
			userHasPermissionToUpdateSecretValue,
			secrets: secrets,
			secretsLength: secretsLength
		};
	}
}

export const actions: import('./$types').Actions = {
	// Handle Secret update:
	add: async ({ request, cookies, params }) => {
		const body = Object.fromEntries(await request.formData());
		const newSecretValue = body.newSecretValue.toString();

		const secureOneCookie = cookies.get('accessToken');
		const account = getAccountName(secureOneCookie!);
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie!);

		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		const accessToken = getRefreshTokenValue(secureOneCookie);
		const resourceId = params.id;

		const send = createClientSender(account!, accessToken!);

		try {
			const response = await send(
				uploadSecret(schemas.ResourceKind.Variable, resourceId, newSecretValue)
			);
			return { success: true, status: response.status };
		} catch (err) {
			error(400);
		}
	}
};
