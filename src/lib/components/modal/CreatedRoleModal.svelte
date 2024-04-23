<script lang="ts">
	import { exportKeysCsv, exportKeysXlsx } from '$lib/api/exportToCsvXlsx';
	import type { CreatedPolicyResponse } from '$lib/api/requests/schemas';
	import { Modal, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	export let modalIsOpen: boolean;
	const dispatch = createEventDispatcher();
	export let createdPolicyResponse: CreatedPolicyResponse | null;
	let formattedRoles: { id: string; api_key: string }[] = [];

	$: if (createdPolicyResponse) {
		const createdRoles = createdPolicyResponse.created_roles;
		const keys: string[] = Object.keys(createdPolicyResponse.created_roles);
		for (let key of keys) {
			formattedRoles.push({ id: createdRoles[key].id, api_key: createdRoles[key].api_key });
		}
	}
	function getCsvExport() {
		let title = `Api_${formattedRoles.length}_key`;
		if (formattedRoles.length > 1) {
			title = `Api_${formattedRoles.length}_keys`;
		}
		exportKeysCsv(formattedRoles, title, ['Id', 'ApiKey']);
	}

	function getXlsxExport() {
		let title = `Api_${formattedRoles.length}_key`;
		if (formattedRoles.length > 1) {
			title = `Api_${formattedRoles.length}_keys`;
		}
		exportKeysXlsx(formattedRoles, title, ['Id', 'ApiKey']);
	}
</script>

<Modal
	defaultClass="relative flex max-h-96 w-full flex-col"
	bind:open={modalIsOpen}
	dismissable={false}
>
	<div class="flex flex-col items-center text-center">
		<div>
			<p class="text-green-600 dark:text-green-500">
				<b>The policy was extended successfully.</b>
			</p>
			<br />
			<p>
				{#if formattedRoles.length == 1}
					<p><b>The following API key are not stored for security reasons.</b></p>
				{:else}
					<p>
						<b
							>The following {formattedRoles.length} API keys are not stored for security reasons.</b
						>
					</p>
				{/if}
			</p>
			<p>
				<b>You will not be able to retrieve these keys after closing this window.</b>
			</p>
			<br />
			{#if formattedRoles.length == 1}
				<p>Please export the following key at safety place:</p>
			{:else}
				<p>Please export the following keys at safety place:</p>
			{/if}

			<br />
		</div>

		<div class="flex flex-col text-left">
			{#each formattedRoles as role}
				<div
					class="mb-3 flex flex-col rounded-md border border-gray-100 bg-bglf p-2 dark:border-gray-500 dark:bg-bgdf"
				>
					<p><b>Id: </b>{role.id}</p>

					<p><b>Api key: </b> <span class="whitespace-normal break-all">{role.api_key}</span></p>
				</div>
			{/each}
		</div>
		<!--   -->
		<div class="w-full justify-between border-t border-gray-500">
			<div class="mt-2 flex flex-wrap justify-between gap-x-2 px-1">
				<button
					id="export-menu-key"
					class="text-normal flex flex-wrap items-center gap-x-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-tmainl hover:bg-gray-100 focus:outline-none dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
					>Export</button
				>
				<Dropdown
					triggeredBy="#export-menu-key"
					containerClass="border z-50"
					headerClass="overflow-hidden rounded-t-md"
					footerClass="overflow-hidden rounded-b-md"
				>
					<DropdownItem
						on:click={getXlsxExport}
						defaultClass="rounded-sm px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
						>XLSX</DropdownItem
					>
					<DropdownItem
						on:click={getCsvExport}
						defaultClass="rounded-sm px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
						>CSV</DropdownItem
					>
				</Dropdown>
				<button
					class="text-normal flex flex-wrap items-center gap-x-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm text-tmaind hover:bg-blue-800 focus:outline-none dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-blue-800 dark:focus:ring-gray-700"
					on:click={() => {
						modalIsOpen = false;
						dispatch('handleResourceRefresh');
					}}>Close</button
				>
			</div>
		</div>
	</div>
</Modal>
