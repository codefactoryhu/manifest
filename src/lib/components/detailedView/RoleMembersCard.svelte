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
	import type { RoleMemberResponse } from '$lib/api/requests/schemas';
	import { getResourceKindFromId, getResourceRoot } from '$lib/api/requests/utils';
	import { ResourceIcon } from '$lib';

	export let title: string;
	export let additionalClass: string = '';
	export let roleMembers: Promise<RoleMemberResponse[]>;

	function getIdentifier(string: string): string | undefined {
		return string.split(':').at(-1);
	}

	function gotoResource(key: string): void {
		const resourceRoot = getResourceRoot(key);
		const identifier = getIdentifier(key);
		goto(`/${resourceRoot}/${encodeURIComponent(identifier!)}`);
	}
</script>

<Card class="h-96 max-w-none {additionalClass}">
	<h4 class="mb-5 text-xl font-bold text-tmainl dark:text-tmaind">{title}</h4>
	{#await roleMembers}
		<div class="relative inset-0 flex h-full flex-row justify-center border border-red-600">
			<Spinner color="gray" />
		</div>
	{:then roleMembershipsResolved}
		<Table
			striped
			class={roleMembershipsResolved.length === 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border !border-gray-100 dark:!border-gray-600 dark:bg-bgds"
		>
			<TableHead theadClass="text-xs uppercase bg-gray-100 dark:bg-gray-700 sticky">
				<TableHeadCell class="w-1/4 text-left" padding="pl-6">Members</TableHeadCell>
				<TableHeadCell class="w-1/4 text-center" padding="p-3">Policy created By</TableHeadCell>
				<TableHeadCell class="w-1/12 text-center" padding="p-3">Owner</TableHeadCell>
			</TableHead>
			{#if roleMembershipsResolved.length === 0}
				<TableBody tableBodyClass="relative">
					<div class=" w- absolute flex h-full w-full items-center justify-center">
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Avaliable Memberships</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each roleMembershipsResolved as membership}
						<TableBodyRow>
							<TableBodyCell>
								<button
									class="flex hover:cursor-pointer"
									on:click={() => {
										gotoResource(membership.member);
									}}
								>
									<ResourceIcon
										resourceKind={getResourceKindFromId(membership.member)}
										color={true}
										class="mr-2"
									>
										<span slot="after-text" let:colorClass class={'font-semibold ' + colorClass}
											>{getIdentifier(membership.member)}</span
										>
									</ResourceIcon>
								</button>
							</TableBodyCell>

							<TableBodyCell tdClass="flex justify-around px-6 py-4 whitespace-nowrap font-medium ">
								<button
									class="flex h-full hover:cursor-pointer"
									on:click={() => {
										gotoResource(membership.policy);
									}}
								>
									<ResourceIcon
										resourceKind={getResourceKindFromId(membership.policy)}
										color={true}
										class="mr-2 "
									>
										<span slot="after-text" let:colorClass class={'font-semibold' + colorClass}
											>{getIdentifier(membership.policy)}</span
										>
									</ResourceIcon>
								</button>
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
								{/if}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			{/if}
		</Table>
	{:catch}
		<ResourceErrorContent
			message={'You do not have "execute" priviliges for you own User. Please contanct System Admin for further help!'}
		/>
	{/await}
</Card>
