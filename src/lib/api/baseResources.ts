import { schemas, utils } from './requests';

export class BaseResource {
	id: string;
	owner: string;
	policy?: string;
	created_at: string;
	parsed_created_at: Date;
	permissions: {
		policy?: string;
		privilege?: string;
		role?: string;
	}[];
	secrets?: {
		expires_at: string | null;
		version: number;
	}[];
	annotations: {
		name: string;
		policy: string;
		value: string;
	}[];

	constructor(params: schemas.ResourceResponse) {
		if (this.constructor === BaseResource) {
			throw new Error("Can't instantiate abstract class");
		} else {
			if (
				params.id === undefined ||
				params.owner === undefined ||
				params.permissions === undefined ||
				params.created_at === undefined ||
				params.annotations === undefined
			) {
				throw new Error('Invalid ResourceResponse');
			}
			this.created_at = params.created_at;
			this.id = params.id;
			this.owner = params.owner;
			this.permissions = params.permissions;
			this.annotations = params.annotations;
			this.parsed_created_at = new Date(this.created_at);
		}
	}

	get identifier(): string {
		return this.id.split(':').at(-1)!;
	}

	get kind(): schemas.ResourceKind {
		return utils.getResourceKindFromId(this.id);
	}

	get colorClass(): string {
		return utils.getColorClass(this.kind);
	}

	get parentIdentifier(): string | undefined {
		if (this.policy) {
			return this.policy.split(':').at(-1)!;
		}
		return undefined;
	}

	get ownerIdentifier(): string {
		return this.owner.split(':').at(-1)!;
	}

	get ownerKind(): schemas.ResourceKind {
		return utils.getResourceKindFromId(this.owner);
	}

	get ownerColorClass(): string {
		return utils.getColorClass(this.ownerKind);
	}

	get parentKind(): schemas.ResourceKind | undefined {
		if (this.policy) {
			return utils.getResourceKindFromId(this.policy);
		}
		return undefined;
	}

	get parentColorClass(): string | undefined {
		if (this.parentKind) {
			return utils.getColorClass(this.parentKind);
		}
	}

	get permissionsCount(): number | undefined {
		if (this.permissions) {
			return this.permissions.length;
		}
		return undefined;
	}

	get secretsCount(): number | undefined {
		if (this.secrets) {
			return this.secrets.length;
		}
		return undefined;
	}

	get formattedDate(): string | undefined {
		if (this.created_at) {
			const userTimeZoneOffset = new Intl.DateTimeFormat().resolvedOptions().timeZone;

			const options: Intl.DateTimeFormatOptions = {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				timeZone: userTimeZoneOffset
			};

			return this.parsed_created_at.toLocaleDateString('en-GB', options);
		}
		return undefined;
	}
}
