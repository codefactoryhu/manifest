import { ResourceKind, type ResourceResponse } from './schemas';
import { pickTheme } from '$lib/components/themePicker/themeStore';
import type { BaseResource } from '../baseResources';
import type { schemas } from '.';
import type { Writable } from 'svelte/store';
import type { TableOptions } from '@tanstack/svelte-table';
import PolicyResource from '../policyResources';
import LayerResource from '../layerResources';
import VariableResource from '../variableResources';
import UserResource from '../userResources';
import HostResource from '../hostResources';
import GroupResource from '../groupResources';
import WebserviceResource from '../webservicesResources';

export function getResourceKindFromId(id: string): ResourceKind {
	const strippedAccountId = id.split(':').at(1)!;
	const resourceKindKey = strippedAccountId.at(0)?.toUpperCase() + strippedAccountId.slice(1);
	return ResourceKind[resourceKindKey as keyof typeof ResourceKind];
}

export function getColorClass(kind: ResourceKind): string {
	const classMap: { [key in ResourceKind]: string } = {
		[ResourceKind.Policy]: 'text-policy',
		[ResourceKind.Layer]: 'text-layer',
		[ResourceKind.Variable]: 'text-variable',
		[ResourceKind.User]: 'text-user',
		[ResourceKind.Host]: 'text-host',
		[ResourceKind.Group]: 'text-group',
		[ResourceKind.Webservice]: 'text-webservice'
	};

	const colorClass = classMap[kind];

	if (colorClass) {
		return colorClass;
	} else {
		throw new Error('Invalid resource kind');
	}
}

export function createBaseResource(resource: ResourceResponse): BaseResource {
	const kind = getResourceKindFromId(resource.id);

	const constructorMap: {
		[key in ResourceKind]: new (resource: ResourceResponse) => BaseResource;
	} = {
		[ResourceKind.Policy]: PolicyResource,
		[ResourceKind.Layer]: LayerResource,
		[ResourceKind.Variable]: VariableResource,
		[ResourceKind.User]: UserResource,
		[ResourceKind.Host]: HostResource,
		[ResourceKind.Group]: GroupResource,
		[ResourceKind.Webservice]: WebserviceResource
	};

	const Constructor = constructorMap[kind];

	if (Constructor) {
		return new Constructor(resource);
	} else {
		throw new Error('Invalid resource kind');
	}
}

export function convertResources<T extends BaseResource>(
	resources: schemas.ResourceResponse[],
	resourceClass: new (params: schemas.ResourceResponse) => T
): T[] {
	return resources.map((resource) => new resourceClass(resource));
}

export function createGoToUrl(resource: BaseResource) {
	return `/${getResourceRoot(resource.id)}/${encodeURIComponent(resource.identifier!)}`;
}

export function createGoToUrlForParent(resource: BaseResource) {
	const resourceRoot = getResourceRoot(resource.policy!);
	return `/${resourceRoot}/${encodeURIComponent(resource.parentIdentifier!)}`;
}
export function createGoToUrlForOwner(resource: BaseResource) {
	const resourceRoot = getResourceRoot(resource.owner!);
	return `/${resourceRoot}/${encodeURIComponent(resource.ownerIdentifier!)}`;
}

export function createGoToUrlBackToTable(resource: BaseResource) {
	const resourceRoot = getResourceRoot(resource.id!);
	return `/${resourceRoot}`;
}

export function getResourceRoot(resourceId: string) {
	const resourceKind = getResourceKind(resourceId);
	return makeItPlural(resourceKind!, false);
}

function getResourceKind(resourceId: string) {
	return resourceId.split(':').at(1);
}

export function makeItPlural(resourceKind: string, capitalizeFirstLetter: boolean = false) {
	const pluralExceptions: Record<string, string> = {
		policy: 'policies'
	};

	const plural = pluralExceptions[resourceKind.toLowerCase()];
	if (plural) {
		return capitalizeFirstLetter ? capitalizeFirstChar(plural) : plural;
	} else {
		const pluralized = resourceKind + 's';
		return capitalizeFirstLetter ? capitalizeFirstChar(pluralized) : pluralized;
	}
}

export function capitalizeFirstChar(resourceTitle: string) {
	return resourceTitle.charAt(0).toUpperCase() + resourceTitle.slice(1);
}

export function handleYamlTheme() {
	if (localStorage.getItem('color-theme') === 'light') {
		pickTheme('Cobalt2');
	} else {
		pickTheme('Blackboard');
	}
}

export function convert(resources: ResourceResponse[]): BaseResource[] {
	return resources.map((obj) => createBaseResource(obj));
}

export function convertResource<T extends BaseResource | PolicyResource>(
	resource: ResourceResponse,
	targetType: 'BaseResource' | 'PolicyResource'
): Promise<T> {
	return new Promise((resolve, reject) => {
		try {
			switch (targetType) {
				case 'BaseResource':
					resolve(createBaseResource(resource) as T);
					break;
				case 'PolicyResource':
					resolve(new PolicyResource(resource) as T);
					break;
				default:
					reject(new Error('Invalid targetType'));
			}
		} catch (error) {
			reject(error);
		}
	});
}

export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

export function getColorClassForSmallCards(kind: ResourceKind): string {
	switch (kind) {
		case ResourceKind.Policy:
			return 'border-policy/30 hover:bg-policy/10 dark:hover:bg-policy/20';
		case ResourceKind.Layer:
			return 'border-layer/30 hover:bg-layer/10 dark:hover:bg-layer/20';
		case ResourceKind.Variable:
			return 'border-variable/30 hover:bg-variable/10 dark:hover:bg-variable/20';
		case ResourceKind.User:
			return 'border-user/30 hover:bg-user/10 dark:hover:bg-user/20';
		case ResourceKind.Host:
			return 'border-host/30 hover:bg-host/10 dark:hover:bg-host/20';
		case ResourceKind.Group:
			return 'border-group/30 hover:bg-group/10 dark:hover:bg-group/20';
		case ResourceKind.Webservice:
			return 'border-webservice/30 hover:bg-webservice/10 dark:hover:bg-webservice/20';
		default:
			return '';
	}
}

export function formatDate(created_at: string): string {
	const date = new Date(created_at);
	const userTimeZoneOffset = new Intl.DateTimeFormat().resolvedOptions().timeZone;

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		timeZone: userTimeZoneOffset
	};

	return date.toLocaleDateString('en-US', options);
}

export function setCurrentPage(
	page: number,
	options: Writable<TableOptions<BaseResource>>,
	pageLimitFromParent: number
) {
	options.update((old) => {
		return {
			...old,
			state: {
				...old.state,
				pagination: {
					...old.state?.pagination,
					pageIndex: page,
					pageSize: pageLimitFromParent,
					pageIndexFromParent: page
				}
			}
		};
	});
}
