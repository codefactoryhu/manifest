import { createClientSender } from '$lib/api/client';
import PolicyResource from '$lib/api/policyResources.js';
import {
	getVariablesOfPolicy,
	resource,
	retrieveSecret,
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	deletePolicy
} from '$lib/api/requests';
import { getResourceKindFromId } from '$lib/api/requests/utils';
import VariableResource from '$lib/api/variableResources';
import { error, redirect } from '@sveltejs/kit';

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
		const resourceToShow = await send(resource(schemas.ResourceKind.Policy, resourceId));
		const policyFormat = new PolicyResource(resourceToShow);

		// Handle Parent:
		const parentKind = policyFormat.parentKind!;
		const parentIdentifier = policyFormat.parentIdentifier;
		const parentPolicy =
			parentKind !== undefined ? await send(resource(parentKind, parentIdentifier!)) : null;

		// Handle Owner:
		const ownerKind = getResourceKindFromId(policyFormat.owner);
		const ownerIdentifier = policyFormat.ownerIdentifier;
		const ownerByPolicyOwnerIdentifier = await send(resource(ownerKind, ownerIdentifier));

		// Handle Variables:
		const policyIdentifier = policyFormat.identifier;
		const variablesByPolicyId = await send(
			getVariablesOfPolicy(schemas.ResourceKind.Variable, policyIdentifier!)
		);

		// Handle Variables Secrets:
		const convertVariables = (variables: schemas.ResourceResponse[]): VariableResource[] => {
			return variables.map((obj) => new VariableResource(obj));
		};

		const getSecretValues = async (resources: VariableResource[]): Promise<string[]> => {
			const secretValues: string[] = [];
			for (const resource of resources) {
				if (resource.secretsCount && resource.secretsCount > 0) {
					const newestVersion = Math.max(...resource.secrets.map((obj) => obj.version), 1);
					const res = await send(
						retrieveSecret(schemas.ResourceKind.Variable, resource.identifier!, newestVersion)
					);
					secretValues.push(res);
				}
			}
			return secretValues;
		};

		const variableResourceArray = convertVariables(variablesByPolicyId);
		const secretsValues = await getSecretValues(variableResourceArray);

		return {
			success: true,
			resource: resourceToShow,
			owner: ownerByPolicyOwnerIdentifier,
			parentPolicy: parentPolicy,
			variables: variablesByPolicyId,
			secretsValues: secretsValues
		};
	}
}

export const actions: import('./$types').Actions = {
	delete: async ({ request, cookies }) => {
		const secureOneCookie = cookies.get('accessToken')!;
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		// Handel delete forms entries:
		const body = Object.fromEntries(await request.formData());
		const deletableItemId = body.deletableItemId.toString();
		const deletableResourceKind = body.deletableResourceKind.toString();
		const parentPolicy = body.parentPolicy.toString();

		// Init Client:
		const account = getAccountName(secureOneCookie!);
		const accessToken = getRefreshTokenValue(secureOneCookie);
		const send = createClientSender(account!, accessToken!);

		let response: Response;
		//<-- Do not reformat this yml part! -->
		const yamlContent = `
  - !delete
    record: !${deletableResourceKind} ${deletableItemId}
`; //<-- Yml format is ended. -->

		if (yamlContent && yamlContent.length > 1) {
			try {
				response = await send(deletePolicy(parentPolicy, yamlContent));
				return { success: true, status: response.status };
			} catch (err) {
				error(400);
			}
		} else {
			error(400);
		}
	}
};
