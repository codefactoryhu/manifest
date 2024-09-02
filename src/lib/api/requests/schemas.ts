import type GroupResource from '../groupResources';
import type HostResource from '../hostResources';
import type LayerResource from '../layerResources';
import type PolicyResource from '../policyResources';
import type UserResource from '../userResources';
import type VariableResource from '../variableResources';
import type WebserviceResource from '../webservicesResources';

export enum ResourceKind {
	User = 'user',
	Host = 'host',
	Layer = 'layer',
	Group = 'group',
	Policy = 'policy',
	Variable = 'variable',
	Webservice = 'webservice'
}

export interface ResourceResponse {
	annotations?: {
		name: string;
		policy: string;
		value: string;
	}[];
	created_at: string;
	id: string;
	owner?: string;
	permissions?: {
		policy?: string;
		privilege?: string;
		role?: string;
	}[];
	policy?: string;
	policy_versions?: {
		client_ip: string;
		created_at: string;
		finished_at: string;
		id: string;
		policy_sha256: string;
		policy_text: string;
		role: string;
		version: number;
	}[];
	restricted_to?: string[];
	secrets?: {
		expires_at: string | null;
		version: number;
	}[];
	permissionsCount?: number;
	secretsCount?: number;
}

export interface ResourceCountResponse {
	count: number;
}

export interface WhoAmiResponse {
	account?: string;
	client_ip?: string;
	token_issued_at?: string;
	user_agent?: string;
	username?: string;
}

export interface ResourceKindListQueryParams {
	search?: string;
	offset?: number;
	limit?: number;
	count?: boolean;
	role?: string;
	acting_as?: string;
}
export interface ResourceQueryParams {
	permitted_roles?: boolean;
	privilege?: string;
	check?: boolean;
	role?: string;
}

export interface SecretResponse {
	value: string;
	expires_at: string;
	version: number;
}
export interface PolicyVersionResource {
	client_ip: string;
	created_at: string;
	created_at_date: string;
	finished_at: string;
	id: string;
	policy_sha256: string;
	policy_text: string;
	role: string;
	version: number;
}

export type PossibleResources =
	| PolicyResource
	| GroupResource
	| HostResource
	| UserResource
	| LayerResource
	| VariableResource
	| WebserviceResource;

export type ResourceStorage = [
	UserResource[],
	HostResource[],
	LayerResource[],
	GroupResource[],
	PolicyResource[],
	VariableResource[],
	WebserviceResource[]
];

export interface Permission {
	policy: string;
	privilege: string;
	role: string;
}
export interface CreatedPolicyResponse {
	created_roles: {
		[key: string]: {
			api_key: string;
			id: string;
		};
	};
	version: number;
}

export interface RoleMembershipsBodyResponse {
	admin_option: boolean;
	ownership: boolean;
	role: string;
	member: string;
	policy: string;
}

export interface RoleMembershipsRequestResponse {
	success: boolean;
	body: RoleMembershipsBodyResponse[];
}

export interface RoleMemberResponse {
	admin_option: boolean;
	ownership: boolean;
	role: string;
	member: string;
	policy: string;
}

export interface ATformat {
	accessToken: string;
	account: string;
	userid: string;
}

export interface IAccessToken {
	protected: string;
	payload: string;
	signature: string;
}

export interface ITokenPayload {
	sub: string;
	exp: string;
	iat: string;
}
