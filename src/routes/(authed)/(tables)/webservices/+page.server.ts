import { createClientSender } from '$lib/api/client';
import type { ClientRequest } from '$lib/api/client_types';
import {
	deletePolicy,
	resourceKindList,
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue,
	loadPolicy,
} from '$lib/api/requests';
import { createYAMLContent } from '$lib/api/requests/utils';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies, depends }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		depends('data:data');
		const secureOneCookie: string = cookies.get('accessToken')!;
		const tokenIsValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!tokenIsValid || tokenIsValid == null) {
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
			const res = await clientContext(resourceKindList(schemas.ResourceKind.Webservice));
			return { success: true, data: res };
		} catch (err) {
			return { success: false, data: [] };
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

		// Handel delete forms entries:
		const body = Object.fromEntries(await request.formData());
		const deletableItemId: string = body.deletableItemId.toString();
		const deletableResourceKind: string = body.deletableResourceKind.toString();
		const parentPolicy: string = body.parentPolicy.toString();

		// Init Client:
		const accountName: string | null = getAccountName(secureOneCookie!);
		const accessToken: string | null = getRefreshTokenValue(secureOneCookie);
		const clientContext: <T>(callback: ClientRequest<T>) => Promise<T> = createClientSender(
			accountName!,
			accessToken!
		);

		let response: Response;
		const yamlContent: string = createYAMLContent(deletableResourceKind, deletableItemId);

		if (yamlContent && yamlContent.length > 1) {
			try {
				response = await clientContext(deletePolicy(parentPolicy, yamlContent));
				return { success: true, status: response.status };
			} catch (err) {
				error(400);
			}
		} else {
			error(400);
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
		const body = Object.fromEntries(await request.formData());
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
