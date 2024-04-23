<script lang="ts">
	import type { schemas } from '$lib/api/requests';
	import {
		Card,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		Button,
		Input,
		Spinner
	} from 'flowbite-svelte';
	import { EyeSolid, EyeSlashSolid } from 'flowbite-svelte-icons';
	import ResourceErrorContent from './ResourceErrorContent.svelte';
	import { displayAlert } from '../alert/AlertStore';
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';

	export let additionalClass: string = '';
	export let secrets: schemas.SecretResponse[];
	let hideInputField: boolean = true;
	export let errorMessage: string =
		'Unexpected Error Happend during fetch, contact support for help';
	export let secretCount: number = 0;
	export let userHasPermissionToUpdateSecretValue: boolean;

	let showSecret: boolean[] = new Array(secretCount ? secretCount : 0);
	let newSecretValue: string;
	let updateButtonIsDisabled: boolean = true;

	$: if (newSecretValue) {
		updateButtonIsDisabled = false;
	} else {
		updateButtonIsDisabled = true;
	}

	function sortSecret(secrets: schemas.SecretResponse[]) {
		return secrets.slice().sort((a, b) => b.version - a.version);
	}

	function blurrButton(index: number) {
		const icon = document.getElementById(`eye-button-${index}`) as HTMLElement;
		icon.blur();
	}

	function toggleShowHidden(index: number) {
		showSecret[index] = !showSecret[index];
		blurrButton(index);
	}

	async function refreshSecret() {
		invalidate('data:data');
	}
</script>

<Card class={`col-start-1 h-96 w-full max-w-none ${additionalClass}`}>
	<div class="items-left mb-2 flex flex-col justify-between gap-y-2 xs:flex-row">
		<h4 class="text-xl font-bold text-tmainl dark:text-tmaind">Secrets</h4>

		<div hidden={hideInputField}>
			<div class="flex flex-wrap justify-center gap-2">
				<Input bind:value={newSecretValue} type="text" defaultClass="px-2" />
				<div>
					<form
						method="POST"
						action="?/add"
						use:enhance={({ formData, cancel }) => {
							formData.append('newSecretValue', newSecretValue);
							if (newSecretValue?.toString().length < 0) {
								cancel();
							}
							return async ({ result }) => {
								if (result.type === 'success') {
									switch (result.status) {
										case 200:
											displayAlert('green', 'Secret successfully added!', 3);
											refreshSecret();
											hideInputField = true;
											break;
										case 401:
											displayAlert(
												'yellow',
												'The request lacks valid authentication credentials',
												5
											);
											break;
										case 403:
											displayAlert(
												'yellow',
												'The authenticated user lacks the necessary privilege',
												3
											);
											break;
										case 422:
											displayAlert('yellow', 'A request parameter was missing or invalid', 3);
											break;
										default:
											displayAlert('red', 'Unexpected Error happend. Please Contact Support!', 3);
											break;
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
						<Button color="light" size="md" type="submit" disabled={updateButtonIsDisabled}>
							Add
						</Button>
						<Button
							color="red"
							size="md"
							on:click={() => {
								hideInputField = true;
							}}
							>Cancel
						</Button>
					</form>
				</div>
			</div>
		</div>
		{#if hideInputField}
			<div>
				<Button
					color="light"
					size="md"
					on:click={() => {
						if (userHasPermissionToUpdateSecretValue) {
							hideInputField = !hideInputField;
						} else {
							displayAlert('yellow', 'You do not have privlige to add secret!', 5);
						}
					}}
				>
					Add
				</Button>
			</div>
		{/if}
	</div>
	{#await secrets}
		<div class="inset-0 flex h-full flex-row items-center justify-center">
			<Spinner color="gray" />
		</div>
	{:then secretResolved}
		<Table
			striped
			class={secretCount === 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border-2 !border-gray-100 dark:!border-gray-700 dark:bg-gray-800"
		>
			<TableHead theadClass="text-xs uppercase bg-gray-100 dark:bg-gray-700">
				<TableHeadCell class="text-left" padding="p-3">Version</TableHeadCell>
				<TableHeadCell padding="p-3">Value</TableHeadCell>
				<TableHeadCell padding=""></TableHeadCell>
			</TableHead>
			{#if secretCount === 0}
				<TableBody tableBodyClass="relative">
					<div
						class="absolute flex h-full w-full items-center justify-center text-tmainl dark:text-tmaind"
					>
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Secrets</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each sortSecret(secretResolved) as secret, index}
						{#if index === 0}
							<TableBodyRow>
								<TableBodyCell
									tdClass="w-1/4 px-3 py-4 whitespace-nowrap font-medium bg-gray-200 dark:bg-gray-900"
								>
									<p class="text-tmainl dark:text-tmaind">Current</p>
								</TableBodyCell>
								{#if showSecret[index]}
									<TableBodyCell
										tdClass="w-1/4 px-3 py-4 whitespace-nowrap font-medium bg-gray-200 dark:bg-gray-900"
									>
										{secret.value}
									</TableBodyCell>
									<TableBodyCell
										tdClass="w-1/12 px-3 py-4 whitespace-nowrap font-medium bg-gray-200 dark:bg-gray-900"
									>
										<button
											on:click={() => {
												toggleShowHidden(index);
											}}
										>
											<EyeSlashSolid
												class="text-tmainl outline-none dark:text-tmaind"
												id={`eye-button-${index}`}
												style="user-select: none"
											/>
										</button>
									</TableBodyCell>
								{:else}
									<TableBodyCell
										tdClass="w-1/4 px-3 py-4 whitespace-nowrap font-medium bg-gray-200 dark:bg-gray-900"
									>
										************
									</TableBodyCell>
									<TableBodyCell
										tdClass="w-1/12 px-3 py-4 whitespace-nowrap font-medium bg-gray-200 dark:bg-gray-900"
									>
										<button
											on:click={() => {
												toggleShowHidden(index);
											}}
										>
											<EyeSolid
												class="outline-none"
												id={`eye-button-${index}`}
												style="user-select: none"
											/>
										</button>
									</TableBodyCell>
								{/if}
							</TableBodyRow>
						{:else}
							<TableBodyRow>
								<TableBodyCell tdClass="w-1/4 px-3 py-4 whitespace-nowrap font-medium ">
									{secret.version}
								</TableBodyCell>
								{#if showSecret[index]}
									<TableBodyCell tdClass="w-1/4 px-3 py-4 whitespace-nowrap font-medium ">
										{secret.value}
									</TableBodyCell>
									<TableBodyCell tdClass="w-1/12 px-3 py-4 whitespace-nowrap font-medium">
										<button
											on:click={() => {
												toggleShowHidden(index);
											}}
										>
											<EyeSlashSolid
												class="text-tmainl outline-none dark:text-tmaind"
												id={`eye-button-${index}`}
												style="user-select: none"
											/>
										</button>
									</TableBodyCell>
								{:else}
									<TableBodyCell tdClass="w-1/4 px-3 py-4 whitespace-nowrap font-medium ">
										************
									</TableBodyCell>
									<TableBodyCell tdClass="w-1/12 px-3 py-4 whitespace-nowrap font-medium">
										<button
											on:click={() => {
												toggleShowHidden(index);
											}}
										>
											<EyeSolid
												id={`eye-button-${index}`}
												class="outline-none"
												style="user-select: none"
											/>
										</button>
									</TableBodyCell>
								{/if}
							</TableBodyRow>
						{/if}
					{/each}
				</TableBody>
			{/if}
		</Table>
	{:catch error}
		<ResourceErrorContent {error} message={errorMessage} />
	{/await}
</Card>
