import { createClientSender } from '$lib/api/client';
import {
	deletePolicy,
	resourceKindList,
	schemas,
	getAccessTokenValidation,
	getAccountName,
	getRefreshTokenValue
} from '$lib/api/requests';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies, depends }) {
	if (!cookies.get('accessToken')) {
		throw redirect(303, `/login`);
	} else {
		depends('data:data');
		const secureOneCookie = cookies.get('accessToken')!;
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			throw redirect(303, `/login?`);
		}

		// Init Client:
		const account = getAccountName(secureOneCookie!);
		const accessToken = getRefreshTokenValue(secureOneCookie);
		const send = createClientSender(account!, accessToken!);

		try {
			const res = await send(resourceKindList(schemas.ResourceKind.Webservice));
			return { success: true, data: res };
		} catch (err) {
			return { success: false, data: [] };
		}
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
	},
	create: async ({ request, cookies }) => {
		const secureOneCookie = cookies.get('accessToken')!;
		const isValid: boolean | null = getAccessTokenValidation(secureOneCookie);
		if (!isValid || isValid == null) {
			cookies.delete('accessToken', { path: '/' });
			redirect(303, `/login`);
		}

		// Handel create forms entries:
		const body = Object.fromEntries(await request.formData());
		const editorContent = body.editorContent.toString();
		const parentPolicy = body.parentPolicy.toString();

		// Init Client:
		const account = getAccountName(secureOneCookie!);
		const accessToken = getRefreshTokenValue(secureOneCookie);
		const send = createClientSender(account!, accessToken!);

		let response: Response;
		if (editorContent && editorContent.length > 2) {
			try {
				response = await send(deletePolicy(parentPolicy, editorContent));
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
