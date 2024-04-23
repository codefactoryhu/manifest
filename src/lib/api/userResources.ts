import type { schemas } from './requests';
import { BaseResource } from './baseResources';

export default class UserResource extends BaseResource implements schemas.ResourceResponse {
	restricted_to?: string[];

	constructor(params: schemas.ResourceResponse) {
		super(params);
		if (params.restricted_to === undefined) {
			throw new Error('Invalid User');
		}
		this.restricted_to = params.restricted_to;
	}
}
