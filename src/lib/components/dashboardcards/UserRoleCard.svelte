<script lang="ts">
	import {
		Card,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { getResourceKindFromId, getResourceRoot } from '$lib/api/requests/utils';
	import { ResourceIcon } from '$lib';
	import { schemas } from '$lib/api/requests';

	export let additionalClass: string;
	export let roleMemberships: schemas.RoleMembershipsResponse[];

	function getIdentifier(string: string) {
		return string.split(':').at(-1);
	}

	function gotoResource(key: string) {
		const resourceRoot = getResourceRoot(key);
		const identifier = getIdentifier(key);
		goto(`/${resourceRoot}/${encodeURIComponent(identifier!)}`);
	}
</script>

<Card class={additionalClass}>
	<h4 class="mb-5 text-xl font-bold text-tmainl dark:text-tmaind">Role Memberships</h4>
	<Table
		striped
		class={roleMemberships.length === 0 ? 'h-full' : ''}
		divClass="relative overflow-x-auto rounded border !border-gray-100 dark:!border-gray-600 dark:bg-bgds"
	>
		<TableHead theadClass="text-xs uppercase bg-gray-100 dark:bg-gray-700 sticky">
			<TableHeadCell class="w-1/3 text-left" padding="pl-6">Membership</TableHeadCell>
			<TableHeadCell class="w-1/12 text-center" padding="p-3">Admin options</TableHeadCell>
			<TableHeadCell class="w-1/12 text-center" padding="p-3">Owner</TableHeadCell>
		</TableHead>
		{#if roleMemberships.length === 0}
			<TableBody tableBodyClass="relative">
				<div class=" w- absolute flex h-full w-full items-center justify-center">
					<p class="text-center text-lg text-tsecl dark:text-tsecd">No Avaliable Memberships</p>
				</div>
			</TableBody>
		{:else}
			<TableBody>
				{#each roleMemberships as membership}
					<TableBodyRow>
						<TableBodyCell>
							<button
								class="flex"
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
</Card>
