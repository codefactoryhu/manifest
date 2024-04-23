<script lang="ts">
	import type { BaseResource } from '$lib/api/baseResources';
	import { Popover } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { utils } from '$lib/api/requests';
	import { ResourceKind } from '$lib/api/requests/schemas';
	import { flexRender, type Cell } from '@tanstack/svelte-table';
	import { ResourceIcon } from '$lib';
	import {
		capitalizeFirstChar,
		createGoToUrl,
		createGoToUrlForOwner,
		createGoToUrlForParent
	} from '$lib/api/requests/utils';

	export let cell: Cell<BaseResource, unknown>;
	export let triggerTag: string;
	export let pageResourceKind: string;
	export let popOverIsEnabled: boolean;

	let original = cell.row.original;
	let cellId = cell.column.columnDef.id;

	function generatePopoverTagForResourceType(
		type: string | unknown,
		pageResourceKind: string
	): string {
		switch (type) {
			case 'id':
				return capitalizeFirstChar(pageResourceKind);
			case 'policy':
				return 'Parent Policy';
			case 'owner':
				return 'Owner';
			case 'created_at':
				return 'Date';
			default:
				return '';
		}
	}

	function getIdentifierForType(
		type: string | unknown,
		original: BaseResource
	): string | undefined {
		switch (type) {
			case 'id':
				return original.identifier;
			case 'policy':
				return original.parentIdentifier;
			case 'owner':
				return original.ownerIdentifier;
			case 'created_at':
				return original.formattedDate;
			default:
				return original.identifier;
		}
	}

	function getColorClass(type: string | unknown, original: BaseResource): string | undefined {
		switch (type) {
			case 'id':
				return original.colorClass;
			case 'owner':
				return original.ownerColorClass;
			case 'policy':
				return original.parentColorClass;
			default:
				return original.identifier;
		}
	}

	function createPopOverEntity(
		type: string | unknown,
		newTrigger: string | undefined
	): {
		parents: string[];
		resource: string;
		id: string | undefined;
	} {
		let resourceIdentifier = getIdentifierForType(type, original);
		let id: string | undefined = newTrigger;

		if (isString(resourceIdentifier)) {
			const elements: string[] = resourceIdentifier.split('/');
			if (elements.length > 1) {
				const resource: string = elements.pop() || '';
				const parents: string[] = elements;
				return { parents, resource, id };
			} else {
				return { parents: [], resource: resourceIdentifier, id };
			}
		} else {
			return { parents: [], resource: '', id };
		}
	}

	$: popoverEntity = createPopOverEntity(cellId, triggerTag);

	let array = ['created_at', 'secretsCount', 'permissionsCount'];
	let cellType = cell.column.columnDef.id!;

	function handleClickBasedOnClickType(type: unknown | string, resource: BaseResource) {
		switch (type) {
			case 'id':
				goto(`${createGoToUrl(resource)}`);
				break;
			case 'owner':
				goto(`${createGoToUrlForOwner(resource)}`);
				break;
			case 'policy':
				goto(`${createGoToUrlForParent(resource)}`);
				break;
			default:
				goto(`${createGoToUrl(resource)}`);
		}
	}

	function isString(value: unknown): value is string {
		return typeof value === 'string';
	}
</script>

{#if !array.includes(cellType)}
	<button
		class="cursor-auto text-left"
		type="button"
		id={popoverEntity.id}
		on:click={() => handleClickBasedOnClickType(cellId, original)}
	>
		{#if !popoverEntity.resource}
			<span class="font-medium">N/A</span>
		{:else if 'owner' === cellType}
			<span
				class={'flex-inline flex cursor-pointer items-center font-medium ' +
					utils.getColorClass(cell.row.original.ownerKind)}
			>
				<ResourceIcon resourceKind={cell.row.original.ownerKind} class="mr-2" size="sm">
					<span slot="after-text" id={popoverEntity.id}>
						<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())}
						></svelte:component>
					</span>
				</ResourceIcon>
			</span>
		{:else}
			<span class="cursor-pointer font-medium">
				<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())}
				></svelte:component>
			</span>
		{/if}
	</button>
{/if}
{#if cellType === 'created_at' || cellType === 'secretsCount' || cellType === 'permissionsCount'}
	<span
		class={`block w-${cellType === 'created_at' ? '36' : '40'} text-${cellType === 'created_at' ? 'left' : 'center'}`}
	>
		<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())}
		></svelte:component>
	</span>
{/if}

{#if popOverIsEnabled && !array.includes(cellType)}
	<Popover class="text-sm font-light dark:text-tmaind" triggeredBy={`#${popoverEntity.id}`}>
		{#if popoverEntity.resource === ''}
			<span class="font-medium">It owns itself!</span>
		{:else}
			<div class="flex flex-wrap gap-x-4">
				{#if popoverEntity.parents.length > 0}
					<div>
						<div class="mb-1 rounded-t-lg p-0 text-xs text-tsecl">
							{#if popoverEntity.parents.length === 1}
								Parent:
							{:else}
								Parents:
							{/if}
						</div>
						<div class={'font-medium ' + utils.getColorClass(ResourceKind.Policy)}>
							{popoverEntity.parents.join(' → ')}
						</div>
					</div>
				{/if}
				<div>
					<div class="mb-1 rounded-t-lg p-0 text-xs text-tsecl">
						{generatePopoverTagForResourceType(cellId, pageResourceKind)}:
					</div>
					<div class={'font-medium ' + getColorClass(cellId, original)}>
						{popoverEntity.resource}
					</div>
				</div>
			</div>
		{/if}
	</Popover>
{/if}
