import type { schemas } from './requests';
import { BaseResource } from './baseResources';

export default class GroupResource extends BaseResource implements schemas.ResourceResponse {
	policy?: string;

	constructor(params: schemas.ResourceResponse) {
		super(params);
		if (params.policy === undefined) {
			throw new Error('Invalid Group');
		}
		this.policy = params.policy;
	}
}
