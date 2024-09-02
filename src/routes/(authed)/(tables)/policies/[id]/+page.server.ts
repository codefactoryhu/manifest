import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import {
	getMainResourceBasedOnKindAndId,
	getParentIdentifierBasedonThisResource,
	getParentKindBasedonThisResource,
	getParentPolicyBasedonParentKindAndParentIdentifier,
	getOwnerByPolicyOwnerIdentifierAndOwnerKind,
	getOwnerIdentifierBasedOnThisResource,
	getOwnerKindBasedonThisResource,
	getIdentifierOfThisPageKindResource,
	getVariablesByThisPolicyIdentifier
} from '$lib/api/requests/utils';

import PolicyResource from '$lib/api/policyResources.js';
import {
	getResourcesByKindAndParentId,
	retrieveSecret,
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	getReportOfDeletingEachHostByIds,
	getDeleteRequestResult
} from '$lib/api/requests';
import type { ResourceResponse } from '$lib/api/requests/schemas';
import { createYAMLContent, extractHostIds } from '$lib/api/requests/utils';
import VariableResource from '$lib/api/variableResources';
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
		const pageResourceKind: schemas.ResourceKind = schemas.ResourceKind.Policy;
		const resourceId: string = params.id;

		// Handle main resource:
		const mainResource: schemas.ResourceResponse | null = await getMainResourceBasedOnKindAndId(
			pageResourceKind,
			resourceId,
			clientContext
		);

		const thisPageKindResource: PolicyResource | null =
			mainResource !== null ? new PolicyResource(mainResource) : null;

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

		const policyIdentifier: string | null =
			getIdentifierOfThisPageKindResource(thisPageKindResource);

		// Handle Variables
		const variablesByPolicyId: ResourceResponse[] | null = await getVariablesByThisPolicyIdentifier(
			policyIdentifier,
			clientContext
		);

		// Handle Variables Secrets:
		const convertVariables: (variables: schemas.ResourceResponse[]) => VariableResource[] = (
			variables: schemas.ResourceResponse[]
		): VariableResource[] => {
			return variables.map((obj) => new VariableResource(obj));
		};

		const getSecretValues: (resources: VariableResource[]) => Promise<string[]> = async (
			resources: VariableResource[]
		): Promise<string[]> => {
			const secretValues: string[] = [];
			for (const resource of resources) {
				if (resource.secretsCount && resource.secretsCount > 0) {
					const newestVersion = Math.max(...resource.secrets.map((obj) => obj.version), 1);
					const res = await clientContext(
						retrieveSecret(schemas.ResourceKind.Variable, resource.identifier!, newestVersion)
					);
					secretValues.push(res);
				}
			}
			return secretValues;
		};

		const variableResourceArray: VariableResource[] | null =
			variablesByPolicyId !== null ? convertVariables(variablesByPolicyId) : null;
		const secretsValues: string[] | null =
			variableResourceArray !== null ? await getSecretValues(variableResourceArray) : null;

		return {
			resource: mainResource,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy,
			variables: variablesByPolicyId,
			secretsValues: secretsValues
		};
	}
}

export const actions: import('./$types').Actions = {
	delete: async ({ request, cookies }) => {
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		// Init Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		// Get values of delete forms entries:
		const body: {
			[k: string]: FormDataEntryValue;
		} = Object.fromEntries(await request.formData());
		const deletableItemId: string = body.deletableItemId.toString();
		const deletableResourceKind: string = body.deletableResourceKind.toString();
		const parentPolicy: string = body.parentPolicy.toString();
		const attachedResourcesDeleteIsConfirmed = body.attachedResourcesDeleteIsConfirmed.toString();

		// Get related hostids of selected Policy
		const hostIdsOfSelectedDeletablePolicy: schemas.ResourceResponse[] | null = await clientContext(
			getResourcesByKindAndParentId(schemas.ResourceKind.Host, deletableItemId)
		);

		const hostIds: string[] | null =
			hostIdsOfSelectedDeletablePolicy !== null
				? extractHostIds(hostIdsOfSelectedDeletablePolicy)
				: null;

		if (attachedResourcesDeleteIsConfirmed === 'true') {
			const deletionResult: {
				success: boolean;
				deletedItemsIds: string[];
				notDeletedItems: string[];
				errorAtThisDelete: string[];
			} | null =
				hostIds !== null ? await getReportOfDeletingEachHostByIds(hostIds, clientContext) : null;

			if (deletionResult !== null && deletionResult.success) {
				const yamlContent: string = createYAMLContent(deletableResourceKind, deletableItemId);
				return getDeleteRequestResult(parentPolicy, yamlContent, clientContext);
			} else {
				const errormessage: string[] = [];
				if (deletionResult !== null && deletionResult.errorAtThisDelete.length > 0) {
					errormessage.push(
						`Errors occurred at these items: ${deletionResult.errorAtThisDelete.join(', ')}.`
					);
				}
				if (deletionResult !== null && deletionResult.notDeletedItems.length > 0) {
					errormessage.push(
						` Status: not deleted items: ${deletionResult.notDeletedItems.join(', ')}.`
					);
				}
				return {
					success: true,
					status: 2001,
					additionalInfo: errormessage
				};
			}
		} else {
			if (hostIds !== null && hostIds.length > 0) {
				return { success: true, status: 403, additionalInfo: hostIds };
			}
			const yamlContent: string = createYAMLContent(deletableResourceKind, deletableItemId);
			return getDeleteRequestResult(parentPolicy, yamlContent, clientContext);
		}
	}
};
