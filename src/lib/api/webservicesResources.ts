import type { schemas } from '$lib/api/requests';
import { BaseResource } from './baseResources';

export default class WebserviceResource extends BaseResource implements schemas.ResourceResponse {
	policy?: string;

	constructor(params: schemas.ResourceResponse) {
		super(params);
		if (
			params.annotations === undefined ||
			params.created_at === undefined ||
			params.id === undefined ||
			params.owner === undefined ||
			params.permissions === undefined ||
			params.policy === undefined
		) {
			throw new Error('Invalid Webservice');
		}
		this.policy = params.policy;
	}
}
