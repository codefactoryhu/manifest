import type { schemas } from '$lib/api/requests';
import { BaseResource } from './baseResources';

export default class PolicyResource extends BaseResource implements schemas.ResourceResponse {
	policy?: string;
	policy_versions: {
		client_ip: string;
		created_at: string;
		created_at_date?: string;
		finished_at: string;
		id: string;
		policy_sha256: string;
		policy_text: string;
		role: string;
		version: number;
	}[];

	constructor(params: schemas.ResourceResponse) {
		super(params);
		if (params.policy_versions === undefined) {
			throw new Error('Invalid Policy');
		}
		this.policy = params.policy;
		this.policy_versions = params.policy_versions.map((policyVersion) => {
			return {
				...policyVersion,
				created_at_date: this.formatedDateOfPolicyVersion(policyVersion.created_at)
			};
		});
		this.parsed_created_at = new Date(this.created_at);
	}

	private formatedDateOfPolicyVersion(created_at: string): string | undefined {
		const userTimeZoneOffset = new Intl.DateTimeFormat().resolvedOptions().timeZone;
		const date = new Date(created_at);
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			timeZone: userTimeZoneOffset
		};

		return date.toLocaleDateString('en-GB', options);
	}
}
