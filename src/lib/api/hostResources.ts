import type { schemas } from './requests';
import { BaseResource } from './baseResources';

export default class HostResource extends BaseResource implements schemas.ResourceResponse {
	policy?: string;
	restricted_to?: string[];

	constructor(params: schemas.ResourceResponse) {
		super(params);
		if (params.policy === undefined || params.restricted_to === undefined) {
			throw new Error('Invalid Host');
		}
		this.policy = params.policy;
		this.restricted_to = params.restricted_to;
	}
}
