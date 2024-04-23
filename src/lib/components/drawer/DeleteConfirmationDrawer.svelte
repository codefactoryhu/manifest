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

	let transitionParamsRight = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
	const resetDrawer = () => {
		deleteDrawerIsHidden = !deleteDrawerIsHidden;
	};
</script>

<Drawer
	placement="right"
	transitionType="fly"
	class="top-16 overflow-auto"
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
									displayAlert('yellow', 'The authenticated user lacks the necessary privilege');
									break;
								case 404:
									displayAlert(
										'yellow',
										`The ${deletedResourceName} referred to a role or resource that does not exist in the specified account.`
									);
									parentPolicy = '';
									break;
								case 409:
									displayAlert(
										'yellow',
										`${deletedResourceName} load already in progress, retry after a delay.`
									);
									break;
								case 422:
									displayAlert(
										'yellow',
										`The request body was empty or the ${deletedResourceName} was not valid YAML`
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
		<p class="mb-6 text-sm text-gray-500 dark:text-gray-400" id="my">
			Are you sure you want to delete this <br /> <br /> <strong>{deletableItemId}</strong>?
		</p>

		<div class="grid grid-cols-2 gap-4">
			<Button color="red" type="submit">Yes, I'm sure</Button>
			<Button color="light" on:click={resetDrawer}>No, cancel</Button>
		</div>
	</form>
</Drawer>
