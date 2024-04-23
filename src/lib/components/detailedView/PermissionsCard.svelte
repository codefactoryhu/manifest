<script lang="ts">
	import type { schemas } from '$lib/api/requests';
	import {
		Card,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell
	} from 'flowbite-svelte';
	import ResourceErrorContent from './ResourceErrorContent.svelte';

	export let resource: schemas.ResourceResponse;
	let formattedPesmissions: schemas.Permission[] = [];

	function formatPermissions() {
		if (resource.permissions) {
			let uniqRoles: Set<string> = new Set();
			resource.permissions?.forEach((permission) => uniqRoles.add(permission.role!));

			uniqRoles.forEach((role) => {
				let priviliges: string[] = [];
				let policy: string = '';
				for (let permission of resource.permissions!) {
					if (permission.role === role) {
						priviliges.push(permission.privilege!);
						policy = permission.policy!;
					}
				}
				formattedPesmissions.push({
					role: role,
					privilege: `[ ${priviliges.join(', ')} ]`,
					policy: policy
				});
			});
		}
	}

	formatPermissions();

	export let additionalClass: string = '';
	export let errorMessage: string = 'There are no Permissions for this resource';
</script>

<Card class={`h-96 max-w-none ${additionalClass}`}>
	<h4 class="mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Permissions</h4>
	{#if formattedPesmissions}
		<Table
			striped
			class={formattedPesmissions.length == 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border !border-gray-100 dark:!border-gray-600 dark:bg-bgds"
		>
			<TableHead theadClass="text-xs uppercase bg-bglf dark:bg-bgdf">
				<TableHeadCell padding="p-3">Role</TableHeadCell>
				<TableHeadCell padding="p-3">Privileges</TableHeadCell>
				<TableHeadCell padding="p-3">Policy</TableHeadCell>
			</TableHead>
			{#if formattedPesmissions.length === 0}
				<TableBody tableBodyClass="relative">
					<div class="absolute flex h-full w-full items-center justify-center">
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Permissions</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each formattedPesmissions as permissions, index}
						<TableBodyRow color={index % 2 === 0 ? undefined : 'default'}>
							<TableBodyCell
								tdClass="px-3 py-4 whitespace-nowrap font-medium  border-b border-t border-gray-100 dark:border-gray-500"
								>{permissions.role}</TableBodyCell
							>
							<TableBodyCell
								tdClass="px-3 py-4 whitespace-nowrap font-medium  border-b border-t border-gray-100 dark:border-gray-500"
								>{permissions.privilege}</TableBodyCell
							>
							<TableBodyCell
								tdClass="px-3 py-4 whitespace-nowrap font-medium border-b border-t border-gray-100 dark:border-gray-500"
								>{permissions.policy}</TableBodyCell
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
