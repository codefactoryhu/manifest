import type { schemas } from '$lib/api/requests';
import { BaseResource } from './baseResources';

export default class VariableResource extends BaseResource implements schemas.ResourceResponse {
	policy?: string;
	secrets: {
		expires_at: string | null;
		version: number;
	}[];

	constructor(params: schemas.ResourceResponse) {
		super(params);
		if (params.policy === undefined || params.secrets === undefined) {
			throw new Error('Invalid Variable');
		}
		this.policy = params.policy;
		this.secrets = params.secrets;
	}
}
