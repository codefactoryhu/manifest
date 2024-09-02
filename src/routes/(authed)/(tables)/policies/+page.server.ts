import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import {
	resourceKindList,
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	loadPolicy,
	getResourcesByKindAndParentId,
	getDeleteRequestResult,
	getReportOfDeletingEachHostByIds
} from '$lib/api/requests';
import { createYAMLContent, extractHostIds } from '$lib/api/requests/utils';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies, depends }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		depends('data:data');
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokentokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokentokenIsValid || tokentokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login?`);
		}

		// Init Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		try {
			const res = await clientContext(resourceKindList(schemas.ResourceKind.Policy));
			return {
				success: true,
				data: res,
				acc: accountName,
				token: accessToken
			};
		} catch (err) {
			return { success: false, data: [], acc: null, token: null };
		}
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
		const attachedResourcesDeleteIsConfirmed: string =
			body.attachedResourcesDeleteIsConfirmed.toString();

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
	},
	create: async ({ request, cookies }) => {
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		// Handel create forms entries:
		const body: {
			[k: string]: FormDataEntryValue;
		} = Object.fromEntries(await request.formData());
		const editorContent: string = body.editorContent.toString();
		const parentPolicy: string = body.parentPolicy.toString();

		// Init Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		let response: Response;
		if (editorContent && editorContent.length > 2) {
			try {
				response = await clientContext(loadPolicy(parentPolicy, editorContent));
				const createdRolesByPolicy = await response.json();
				console.log(JSON.stringify(createdRolesByPolicy));
				return {
					success: true,
					status: response.status,
					data: JSON.stringify(createdRolesByPolicy)
				};
			} catch (err) {
				error(400);
			}
		} else {
			error(400);
		}
	}
};
