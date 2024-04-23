<script lang="ts">
	import ResourceErrorContent from '../detailedView/ResourceErrorContent.svelte';
	import {
		Card,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		Spinner
	} from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import type { RoleMembershipsResponse } from '$lib/api/requests/schemas';
	import { getResourceKindFromId, getResourceRoot } from '$lib/api/requests/utils';
	import { ClientHttpError } from '$lib/api/errors';
	import { ResourceIcon } from '$lib';

	export let additionalClass: string;
	export let title: string;
	export let resource: Promise<RoleMembershipsResponse[]> = Promise.reject(
		new ClientHttpError(404, 'Error at loading Membership list')
	);

	function getIdentifier(string: string) {
		return string.split(':').at(-1);
	}

	function gotoResource(key: string) {
		const resourceRoot = getResourceRoot(key);
		const identifier = getIdentifier(key);
		goto(`/${resourceRoot}/${encodeURIComponent(identifier!)}`);
	}
</script>

<Card class={`h-96 max-w-none ${additionalClass}`}>
	<h4 class="mb-5 text-xl font-bold text-tmainl dark:text-tmaind">{title}</h4>
	{#await resource}
		<div class="inset-0 flex h-full flex-row items-center justify-center">
			<Spinner color="gray" />
		</div>
	{:then resourceResolved}
		<Table
			striped
			class={resourceResolved.length === 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border !border-gray-100 dark:!border-gray-600 dark:bg-bgds"
		>
			<TableHead theadClass="text-xs uppercase bg-gray-100 dark:bg-gray-700 sticky">
				<TableHeadCell class="w-1/3 text-left" padding="pl-6">Membership</TableHeadCell>
				<TableHeadCell class="w-1/12 text-center" padding="p-3">Admin options</TableHeadCell>
				<TableHeadCell class="w-1/12 text-center" padding="p-3">Owner</TableHeadCell>
			</TableHead>
			{#if resourceResolved.length === 0}
				<TableBody tableBodyClass="relative">
					<div class="absolute flex h-full w-full items-center justify-center">
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Avaliable Memberships</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each resourceResolved as membership}
						<TableBodyRow>
							<TableBodyCell>
								<button
									class="flex hover:cursor-pointer"
									on:click={() => {
										gotoResource(membership.role);
									}}
								>
									<ResourceIcon
										resourceKind={getResourceKindFromId(membership.role)}
										color={true}
										class="mr-2 "
									>
										<span slot="after-text" let:colorClass class={'font-semibold ' + colorClass}
											>{getIdentifier(membership.role)}</span
										>
									</ResourceIcon>
								</button>
							</TableBodyCell>
							<TableBodyCell>
								{#if membership.admin_option}
									<svg
										class=" flex h-6 w-full justify-center text-green-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="m5 12 4.7 4.5 9.3-9"
										/>
									</svg>
								{:else}
									<svg
										class="flex h-6 w-full justify-center text-red-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18 18 6m0 12L6 6"
										/>
									</svg>
								{/if}
							</TableBodyCell>
							<TableBodyCell>
								{#if membership.ownership}
									<svg
										class="flex h-6 w-full justify-center text-green-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="m5 12 4.7 4.5 9.3-9"
										/>
									</svg>
								{:else}
									<svg
										class="flex h-6 w-full justify-center text-red-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18 18 6m0 12L6 6"
										/>
									</svg>
								{/if}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			{/if}
		</Table>
	{:catch error}
		<ResourceErrorContent
			{error}
			message={'You do not have "execute" privliges for you own User. Please contanct System Admin for further help!'}
		/>
	{/await}
</Card>
