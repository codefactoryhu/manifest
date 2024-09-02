<script lang="ts">
	import { Drawer, Button, CloseButton } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte';
	import { displayAlert } from '../alert/AlertStore';
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	export let deleteDrawerIsHidden: boolean;
	export let deletableItemId: string;
	export let parentPolicy: string;
	export let deletableResourceKind: string;

	const dispatch = createEventDispatcher();

	let transitionParamsRight: {
		x: number;
		duration: number;
		easing: (t: number) => number;
	} = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
	const resetDrawer = () => {
		deleteDrawerIsHidden = !deleteDrawerIsHidden;
		showSecondConfirmation = false;
		attachedResourcesDeleteIsConfirmed = 'false';
	};

	let showSecondConfirmation: boolean = false;
	let attachedResourcesDeleteIsConfirmed: string = 'false';
	let attachedDeletableItems: unknown[];
	let isChecked: boolean = false;

	function toggleCheckbox(): void {
		isChecked = !isChecked;
		attachedResourcesDeleteIsConfirmed = isChecked.toString();
	}
</script>

<Drawer
	placement="right"
	transitionType="fly"
	class="top-16 overflow-auto"
	activateClickOutside={false}
	transitionParams={transitionParamsRight}
	bind:hidden={deleteDrawerIsHidden}
>
	<form
		method="POST"
		action="?/delete"
		use:enhance={({ formData, cancel }) => {
			formData.append('deletableItemId', deletableItemId);
			formData.append('parentPolicy', parentPolicy);
			formData.append('deletableResourceKind', deletableResourceKind);
			formData.append('attachedResourcesDeleteIsConfirmed', attachedResourcesDeleteIsConfirmed);

			if (
				deletableItemId?.toString().length < 0 ||
				parentPolicy?.toString().length < 0 ||
				deletableResourceKind?.toString().length < 0
			) {
				cancel();
			}
			return async ({ result }) => {
				if (result.type === 'success') {
					const deletedResourceName =
						deletableResourceKind.charAt(0).toUpperCase() + deletableResourceKind.substring(1);
					switch (result.status) {
						case 200:
							switch (result.data?.status) {
								case 201:
									displayAlert(
										'green',
										`${deletedResourceName} with id:${deletableItemId} has been successfully deleted!`,
										5
									);
									dispatch('handleResourceRefresh');
									resetDrawer();
									break;
								case 401:
									displayAlert('yellow', 'The request lacks valid authentication credentials.');
									break;
								case 403:
									if (result.data.additionalInfo) {
										displayAlert(
											'red',
											`A few resources still belong to ${deletableResourceKind}:${deletableItemId}. Please delete them first and try it again!`
										);
										showSecondConfirmation = true;
										attachedDeletableItems = Object.values(result.data.additionalInfo);
										break;
									} else {
										displayAlert('yellow', 'The authenticated user lacks the necessary privilege');
										break;
									}
								case 404:
									displayAlert(
										'yellow',
										`The ${deletableItemId} referred to a role or resource that does not exist in the specified account.`
									);
									parentPolicy = '';
									break;
								case 409:
									displayAlert(
										'yellow',
										`${deletableItemId} load already in progress, retry after a delay.`
									);
									break;
								case 422:
									displayAlert(
										'yellow',
										`The request body was empty or the ${deletableItemId} was not valid YAML`
									);
									break;
								case 2001:
									displayAlert(
										'red',
										`Some items were not deleted successfully! Details:
											 ${result.data.additionalInfo}`
									);
									break;
							}
					}
				} else if (result.type === 'redirect') {
					goto(result.location, { invalidateAll: true });
				} else if (result.type === 'error') {
					displayAlert(
						'yellow',
						'Oops! Looks like something went wrong while sending your request, please try again!',
						5
					);
				} else {
					await applyAction(result);
				}
			};
		}}
	>
		<div class="flex items-center">
			<h5
				id="drawer-label"
				class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"
			>
				<InfoCircleSolid
					class="me-2.5 h-4 w-4 border-none outline-none"
					style="color: rgb(200 30 30)"
				/>DELETE
			</h5>
			<CloseButton
				on:click={() => {
					resetDrawer();
				}}
				class="mb-4 dark:text-white"
			/>
		</div>

		{#if showSecondConfirmation}
			<p class="mb-6 text-sm text-red-500 dark:text-red-400" id="my">
				To DELETE this <strong>{deletableResourceKind}:{deletableItemId}</strong>, confirmation
				needed to delete the following resources too:
			</p>
			<ul class=" mb-6 list-disc px-6 text-sm text-gray-500 dark:text-gray-400">
				{#each attachedDeletableItems as item}
					<li>{item}</li>
				{/each}
			</ul>
			<p class="mb-6 text-sm text-red-500 dark:text-red-400" id="my">
				Are you sure you want to <strong>delete all</strong> of them?
			</p>
		{:else}
			<p class="mb-6 text-sm text-gray-500 dark:text-gray-400" id="my">
				Are you sure you want to delete this <br /> <br /> <strong>{deletableItemId}</strong>?
			</p>
		{/if}
		{#if showSecondConfirmation}
			<div class="mb-4 flex items-center">
				<input
					type="checkbox"
					id="checked-checkbox"
					checked={isChecked}
					on:change={toggleCheckbox}
					class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
				/>
				<label
					for="checked-checkbox"
					class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
				>
					Yes, I'm sure, please delete all.
				</label>
			</div>
		{/if}
		<div class="grid grid-cols-2 gap-4">
			{#if showSecondConfirmation}
				<Button color="red" type="submit" disabled={!isChecked}>Confirm</Button>
			{:else}
				<Button color="red" type="submit">Yes, I'm sure</Button>
			{/if}
			<Button color="light" on:click={resetDrawer}>No, cancel</Button>
		</div>
	</form>
</Drawer>

<style>
	input[type='checkbox']:focus {
		outline: none; /* Removes the focus outline at checkbox */
		box-shadow: none; /* Removes the focus box-shadow if present at checkbox */
	}
</style>
