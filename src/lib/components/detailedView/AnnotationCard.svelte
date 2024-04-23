<script lang="ts">
	import type { schemas } from '$lib/api/requests';

	import {
		Card,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import ResourceErrorContent from './ResourceErrorContent.svelte';

	export let resource: schemas.ResourceResponse;
	export let additionalClass: string = '';
	export let errorMessage: string = 'There are no Permissions for this resource';
</script>

<Card class={`h-96  max-w-none ${additionalClass}`}>
	<h4 class="mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Annotations</h4>
	{#if resource.annotations}
		<Table
			striped
			class={resource.annotations.length == 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border-2 !border-gray-100 dark:!border-gray-700 dark:bg-bgds"
		>
			<TableHead theadClass="text-xs uppercase bg-bglf dark:bg-bgdf">
				<TableHeadCell padding="p-3">Name</TableHeadCell>
				<TableHeadCell padding="p-3">Value</TableHeadCell>
			</TableHead>

			{#if resource.annotations.length === 0}
				<TableBody tableBodyClass="relative">
					<div class="absolute flex h-full w-full items-center justify-center">
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Annotations</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each resource.annotations as annotation}
						<TableBodyRow>
							<TableBodyCell tdClass="px-3 py-4 whitespace-nowrap font-medium"
								>{annotation.name}</TableBodyCell
							>
							<TableBodyCell tdClass="px-3 py-4 whitespace-nowrap font-medium"
								>{annotation.value}</TableBodyCell
							>
						</TableBodyRow>
					{/each}
				</TableBody>
			{/if}
		</Table>
	{:else}
		<ResourceErrorContent message={errorMessage} />
	{/if}
</Card>
