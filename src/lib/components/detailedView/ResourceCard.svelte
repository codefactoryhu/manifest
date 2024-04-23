<script lang="ts">
	import { Card, DescriptionList, List } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import ResourceErrorCard from './ResourceErrorContent.svelte';
	import type { BaseResource } from '$lib/api/baseResources';
	import { createGoToUrl, createGoToUrlBackToTable, formatDate } from '$lib/api/requests/utils';
	import { page } from '$app/stores';
	import { TrashBinSolid } from 'flowbite-svelte-icons';
	import DeleteConfirmationDrawer from '../drawer/DeleteConfirmationDrawer.svelte';
	import { ResourceIcon } from '$lib';

	export let resource: Promise<BaseResource> | BaseResource;
	export let title: string;
	export let additionalClass: string = '';
	export let errorMessage: string = `There is no ${title}`;

	let deleteDrawerIsHidden: boolean = true;
	let deletableItemId: string = '';
	let cardResourceKind: string;
	let deletableItemParent: string;

	function handleDeleteButton(
		resourceId?: string,
		resourceKind?: string,
		parentIdentifier?: string
	) {
		if (parentIdentifier == undefined && resourceId == 'root') {
			deletableItemParent == 'root';
			deletableItemId = resourceId;
		}
		if (resourceId !== undefined && parentIdentifier !== undefined) {
			deletableItemId = resourceId;
			deletableItemParent = parentIdentifier;
		}
		if (resourceKind !== undefined) {
			cardResourceKind = resourceKind;
		}

		deleteDrawerIsHidden = false;
	}

	function handleBackToTable(resource?: BaseResource) {
		if (resource !== undefined) {
			const goBackToTableUrl = createGoToUrlBackToTable(resource);
			goto(`${goBackToTableUrl}`);
		}
	}
</script>

<Card class={`h-96 max-w-none ${additionalClass}`}>
	{#await resource then resourceResolved}
		<div class="mb-4 flex flex-wrap items-center justify-between">
			<div class="flex items-center">
				<h4 class=" text-xl font-bold text-tmainl dark:text-tmaind">{title}</h4>
				{#if $page.url.pathname !== createGoToUrl(resourceResolved)}
					<button
						class="pl-3"
						on:click={() => {
							goto(`${createGoToUrl(resourceResolved)}`);
						}}
					>
						<svg
							class="h-4 w-4 text-xl text-tmainl dark:text-tmaind"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 18 18"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
							/>
						</svg>
					</button>
				{/if}
			</div>
			{#if title === 'Policy Info' && resourceResolved.identifier !== 'root'}
				<TrashBinSolid
					on:click={() =>
						handleDeleteButton(
							resourceResolved.identifier,
							resourceResolved.kind,
							resourceResolved.parentIdentifier
						)}
					class="h-8 w-8 rounded-md border px-2 py-2 hover:bg-hlbg hover:text-red-600 focus:outline-none dark:border-brd dark:bg-transparent dark:hover:bg-hdbg dark:hover:text-red-600 "
				/>
				<DeleteConfirmationDrawer
					on:handleResourceRefresh={() => handleBackToTable(resourceResolved)}
					bind:deleteDrawerIsHidden
					{deletableItemId}
					parentPolicy={deletableItemParent}
					deletableResourceKind={cardResourceKind}
				/>
			{/if}
		</div>
		<List
			tag="dl"
			class=" divide-y divide-gray-200 text-tmainl dark:divide-gray-700 dark:text-tmaind"
		>
			<div class="flex flex-col pb-2">
				<DescriptionList tag="dd">Identifier</DescriptionList>
				<DescriptionList tag="dt" class="mb-1 flex items-center">
					<ResourceIcon
						color={true}
						class="mr-2 whitespace-normal break-all"
						resourceKind={resourceResolved.kind}
					>
						<span let:colorClass class={colorClass} slot="after-text"
							>{resourceResolved.identifier}</span
						>
					</ResourceIcon>
				</DescriptionList>
			</div>
			<div class="flex flex-col pb-2">
				<DescriptionList tag="dd">Full ID</DescriptionList>
				<DescriptionList tag="dt" class="mb-1 flex flex-col whitespace-normal break-all"
					>{resourceResolved.id}</DescriptionList
				>
			</div>
			<div class="flex flex-col pb-2">
				<DescriptionList tag="dd">Owner</DescriptionList>
				<DescriptionList tag="dt" class="mb-1 flex items-center">
					<ResourceIcon color={true} class="mr-2" resourceKind={resourceResolved.ownerKind}>
						<span let:colorClass class={colorClass} slot="after-text"
							>{resourceResolved.ownerIdentifier}</span
						>
					</ResourceIcon>
				</DescriptionList>
			</div>
			<div class="flex flex-col pb-2">
				<DescriptionList tag="dd">Created At</DescriptionList>
				<DescriptionList tag="dt" class="mb-1"
					>{formatDate(resourceResolved.created_at)}</DescriptionList
				>
			</div>
		</List>
	{:catch error}
		<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">{title}</h4>
		<ResourceErrorCard {error} message={errorMessage} />
	{/await}
</Card>
