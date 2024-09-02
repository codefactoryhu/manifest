import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import { ClientHttpError } from '$lib/api/errors';
import {
	getMainResourceBasedOnKindAndId,
	getOwnerByPolicyOwnerIdentifierAndOwnerKind,
	getOwnerIdentifierBasedOnThisResource,
	getOwnerKindBasedonThisResource,
	getParentIdentifierBasedonThisResource,
	getParentKindBasedonThisResource,
	getParentPolicyBasedonParentKindAndParentIdentifier,
	getSecretsLength,
	mainResourceHasSecret
} from '$lib/api/requests/utils';

import {
	checkUserPermission,
	retrieveSecret,
	schemas,
	uploadSecret,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	getUserId
} from '$lib/api/requests';

import VariableResource from '$lib/api/variableResources.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies, params, depends }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		depends('data:data');
		const secureOneCookie: string | undefined = cookies.get('accessToken');
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie!);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login`);
		}

		// Handle Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie!);

		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		// DefineResourceKind and GetResourceId
		const pageResourceKind: schemas.ResourceKind = schemas.ResourceKind.Variable;
		const resourceId: string = params.id;

		// Handle main resource:
		const mainResource: schemas.ResourceResponse | null = await getMainResourceBasedOnKindAndId(
			pageResourceKind,
			resourceId,
			clientContext
		);

		const thisPageKindResource: VariableResource | null =
			mainResource !== null ? new VariableResource(mainResource) : null;

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

		// Handle User Permissions
		const userid: string | null = getUserId(secureOneCookie!);
		const userHasPermissionToFechSecretValue: boolean = await clientContext(
			checkUserPermission(
				schemas.ResourceKind.Variable,
				encodeURIComponent(resourceId),
				'execute',
				userid!
			)
		);

		const userHasPermissionToUpdateSecretValue: boolean = await clientContext(
			checkUserPermission(
				schemas.ResourceKind.Variable,
				encodeURIComponent(resourceId),
				'update',
				userid!
			)
		);

		// Handle Secrets
		const secretsLength: number = getSecretsLength(mainResource);
		const hasSecret: boolean = mainResourceHasSecret(mainResource);

		const getSecretsDetails = async (
			hasPermission: boolean,
			resource: VariableResource | null,
			hasSecret: boolean,
			resourceId: string
		) => {
			if (hasSecret) {
				if (hasPermission && resource !== null && resource.secrets) {
					try {
						const result: Promise<schemas.SecretResponse[]> = Promise.all(
							resource.secrets.map(async (secret) => {
								const value = await clientContext(
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
			thisPageKindResource,
			hasSecret,
			resourceId
		);

		return {
			resourceId: resourceId,
			resource: mainResource,
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
		const body: {
			[k: string]: FormDataEntryValue;
		} = Object.fromEntries(await request.formData());
		const newSecretValue: string = body.newSecretValue.toString();

		const secureOneCookie: string | undefined = cookies.get('accessToken');
		const accountName: string | null = getAccountName(secureOneCookie!);
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie!);

		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const resourceId: string = params.id;

		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		try {
			const response = await clientContext(
				uploadSecret(schemas.ResourceKind.Variable, resourceId, newSecretValue)
			);
			return { success: true, status: response.status };
		} catch (err) {
			error(400);
		}
	}
};
