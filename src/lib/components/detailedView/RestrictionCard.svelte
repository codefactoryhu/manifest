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
	export let errorMessage: string = 'There are no Restrictions defined for this resource';
</script>

<Card class={`h-96 w-full max-w-none ${additionalClass}`}>
	<h4 class="mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Restrictions</h4>
	{#if resource.restricted_to}
		<Table
			striped
			class={resource.restricted_to.length == 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border-2 !border-gray-100 dark:!border-gray-700 dark:bg-gray-800"
		>
			<TableHead theadClass="text-xs uppercase bg-bglf dark:bg-bgdf">
				<TableHeadCell padding="p-3">Restricted to</TableHeadCell>
			</TableHead>
			{#if resource.restricted_to.length === 0}
				<TableBody tableBodyClass="relative">
					<div class="absolute flex h-full w-full items-center justify-center">
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Restrictions</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each resource.restricted_to as restrictions}
						<TableBodyRow>
							<TableBodyCell tdClass="px-3 py-4 whitespace-nowrap font-medium"
								>{restrictions}</TableBodyCell
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
