<script lang="ts">
	import CreatedRoleModal from '../modal/CreatedRoleModal.svelte';
	import {
		Drawer,
		Button,
		Label,
		Fileupload,
		Input,
		CloseButton,
		TabItem,
		Tabs,
		Helper,
		Tooltip
	} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import {
		FileCirclePlusOutline,
		InfoCircleSolid,
		TextSizeOutline,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';
	import { PolicyEditor } from '$lib';
	import { displayAlert } from '../alert/AlertStore';
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { CreatedPolicyResponse } from '$lib/api/requests/schemas';

	export let policyDrawerHidden: boolean;

	const dispatch = createEventDispatcher();

	let createdRolesByPolicy: CreatedPolicyResponse | null;
	let files: FileList | undefined;
	let fileValue: string | undefined;
	let parentPolicy: string;
	let editorContent = '';
	let fileContent = '';

	let uploadIsDisabled: boolean = true;
	let deleteIsDisabled: boolean = true;
	let modalIsOpen: boolean = false;
	let policyInputIsCorrect: boolean | null = null;
	let yamlSyntaxIsCorrect: boolean | null = null;

	$: uploadIsDisabled =
		editorContent?.toString().length > 2 && parentPolicy?.toString().length > 0 ? false : true;
	$: deleteIsDisabled = fileValue && fileValue.toString().length > 0 ? false : true;
	$: yamlSyntaxIsCorrect = editorContent ? null : null;
	$: policyInputIsCorrect = parentPolicy ? null : null;

	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	async function readFile(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				const content = reader.result as string;
				resolve(content);
			};

			reader.onerror = (error) => {
				reject(error);
			};

			reader.readAsText(file);
		});
	}

	$: if (files) {
		readFileContent();
	}

	async function readFileContent() {
		if (files && files.length > 0) {
			const file = files[0];
			if (file.name.endsWith('.yml') || file.name.endsWith('.yaml')) {
				try {
					const content = await readFile(file);
					fileContent = content;
				} catch (error) {
					console.error('Error reading file:', error);
					displayAlert('red', 'Error reading file:\n' + error);
				}
			} else {
				removeFile();
				displayAlert('yellow', 'Only .yml, .yaml file format is accepted');
			}
		}
	}

	const resetDrawer = () => {
		parentPolicy = '';
		policyDrawerHidden = !policyDrawerHidden;
		editorContent = ' ';
		removeFile();
	};

	const getFileUploadElemnt = () => {
		return document.getElementById(`file-uploader`) as HTMLFormElement;
	};

	const getRemoveFileButton = () => {
		return document.getElementById(`remove-file-button`) as HTMLFormElement;
	};

	const removeFile = () => {
		const fileUpload = getFileUploadElemnt();

		if (fileUpload !== null) {
			fileUpload.value = '';
			fileContent = ' ';
		}
		const removeFileButton = getRemoveFileButton();
		if (removeFileButton !== null) {
			removeFileButton.blur();
		}
	};

	function convertCreatedRoles(createdPolicyResponse: Record<string, unknown> | undefined) {
		if (createdPolicyResponse) {
			const parsedObject = JSON.parse(JSON.stringify(createdPolicyResponse));
			const data = JSON.parse(parsedObject.data);
			const createdPolicyType: CreatedPolicyResponse = {
				created_roles: data.created_roles,
				version: data.version
			};
			return createdPolicyType;
		} else {
			return null;
		}
	}

	let errorMessage =
		'The policy referred to a role or resource that does not exist in the specified account.';

	function clearParentPolicy() {
		parentPolicy = '';
	}

	function setParentPolicy(value: string) {
		parentPolicy = value;
	}
</script>

<CreatedRoleModal
	{modalIsOpen}
	createdPolicyResponse={createdRolesByPolicy}
	on:handleResourceRefresh
/>
<Drawer
	placement="right"
	class="top-16 w-full overflow-auto sm:w-full md:w-1/2 xl:w-1/3"
	transitionType="fly"
	activateClickOutside={false}
	{transitionParams}
	bind:hidden={policyDrawerHidden}
	id="sidebar"
>
	<div id="drawer-content" class="flex h-full flex-col items-start">
		<div id="drawer-head" class="flex w-full items-center">
			<h5
				id="drawer-label"
				class="inline-flex items-center text-base font-semibold uppercase text-gray-500 dark:text-gray-400"
			>
				<InfoCircleSolid class="me-2.5 h-4 w-4" />Upload your Policy here
			</h5>
			<CloseButton
				on:click={() => {
					resetDrawer();
				}}
				class="dark:text-white"
			/>
		</div>

		<Tabs
			contentClass="w-full grow flex [&>*]:flex [&>*]:flex-col [&>*]:grow [&>*]:w-full bg-gray-100 dark:bg-gray-700 p-4"
			defaultClass="flex w-full flex-wrap text-tmainl dark:text-tmaind rtl:space-x-reverse"
			activeClasses="p-4 text-tmainl rounded-t-lg hover:text-tmainl bg-gray-100 dark:text-tmaind dark:bg-gray-700 dark:text-gray-300"
		>
			<TabItem open title="Yaml">
				<div slot="title" class="flex items-center gap-2">
					<TextSizeOutline size="sm" class="mb-0.5 mr-1 inline-block h-4 w-5 outline-none" />
					YAML
				</div>
				<div class="mb-2">
					<div class="flex flex-wrap items-center justify-between">
						<Label for="parent-policy" class="mb-2 block">1. Parent Policy *</Label>
						<div class="flex flex-wrap gap-x-1">
							<button
								class="mb-2 block rounded-md bg-gray-200 p-2 text-gray-500 outline-none dark:bg-gray-600 dark:text-tmaind"
								on:click={clearParentPolicy}
								><TrashBinSolid size="xs" class="outline-none" /></button
							>
							<Tooltip class="text-xs">Delete</Tooltip>
							<button
								class="mb-2 block rounded-md bg-gray-200 p-1 text-gray-500 outline-none dark:bg-gray-600 dark:text-tmaind"
								on:click={() => setParentPolicy('root')}>root</button
							>
							<Tooltip class="text-xs">Insert</Tooltip>
						</div>
						<Input
							id="parent-policy"
							color={policyInputIsCorrect === null
								? policyInputIsCorrect
									? 'green'
									: 'base'
								: 'red'}
							placeholder="ex.: root"
							bind:value={parentPolicy}
						/>
						{#if policyInputIsCorrect === false}
							<Helper class="mt-2" color="red"
								><span class="font-medium">Error: </span> {errorMessage}</Helper
							>
						{/if}
					</div>
				</div>
				<div class="flex flex-wrap items-center justify-between">
					<Label class="mb-2 block">2. YAML syntax: *</Label>
					<div class="flex flex-wrap gap-x-1">
						<button
							class="mb-2 block rounded-md bg-gray-200 p-2 text-gray-500 outline-none dark:bg-gray-600 dark:text-tmaind"
							on:click={() => {
								fileContent = '- ';
							}}
							><TrashBinSolid size="xs" class="outline-none" />
						</button>
						<Tooltip class="text-xs">Delete</Tooltip>
						<button
							class="mb-2 block rounded-md bg-gray-200 px-2 outline-none dark:bg-gray-600 dark:text-tmaind"
							on:click={() => {
								fileContent = '- !';
							}}
							>- !
						</button>
						<Tooltip class="text-xs">Insert</Tooltip>
					</div>
				</div>

				{#if yamlSyntaxIsCorrect == false}
					<Helper color="red"
						><span class="font-medium">Error: </span> The policy was not valid YAML or the policy includes
						a deletion.
					</Helper>
				{/if}
				<PolicyEditor bind:editorContent {fileContent} syntaxIsCorrect={yamlSyntaxIsCorrect} />
			</TabItem>
			<TabItem title="File">
				<div slot="title" class="flex items-center gap-2">
					<FileCirclePlusOutline size="sm" class="mb-0.5 mr-1 inline-block h-4 w-5 outline-none " />
					Import
				</div>
				<div class="mb-2">
					<div class="flex flex-wrap items-center justify-between">
						<Label for="parent-policy" class="mb-2 block">1. Parent Policy *</Label>
						<div class="flex flex-wrap gap-x-1">
							<button
								class="mb-2 block rounded-md bg-gray-200 p-2 text-gray-500 outline-none dark:bg-gray-600 dark:text-tmaind"
								on:click={clearParentPolicy}
								><TrashBinSolid size="xs" class="outline-none" /></button
							>
							<Tooltip class="text-xs">Delete</Tooltip>
							<button
								class="mb-2 block rounded-md bg-gray-200 p-1 text-gray-500 outline-none dark:bg-gray-600 dark:text-tmaind"
								on:click={() => setParentPolicy('root')}>root</button
							>
							<Tooltip class="text-xs">Insert</Tooltip>
						</div>
						<Input
							id="parent-policy"
							color={policyInputIsCorrect === null
								? policyInputIsCorrect
									? 'green'
									: 'base'
								: 'red'}
							placeholder="ex.: root"
							bind:value={parentPolicy}
						/>
						{#if policyInputIsCorrect === false}
							<Helper class="mt-2" color="red"
								><span class="font-medium">Error: </span> {errorMessage}</Helper
							>
						{/if}
					</div>
				</div>
				<Label class="mb-2 block">2. Upload file *</Label>
				<div class="flex">
					<Fileupload bind:files bind:value={fileValue} id="file-uploader" class="grow" />
					<Button
						color="blue"
						on:click={() => {
							removeFile();
						}}
						disabled={deleteIsDisabled}
						id="remove-file-button"
						class="ml-3"
					>
						<TrashBinSolid size="sm" class="h-4 w-4 outline-none" />
					</Button>
				</div>
				<Label class="mb-2 mt-2 block">Your syntax preview:</Label>
				{#if yamlSyntaxIsCorrect == false}
					<Helper color="red"
						><span class="font-medium">Error: </span> The policy was not valid YAML or the policy includes
						a deletion.
					</Helper>
				{/if}
				<PolicyEditor bind:editorContent {fileContent} syntaxIsCorrect={yamlSyntaxIsCorrect} />
			</TabItem>
		</Tabs>

		<form
			class="w-full py-3"
			method="POST"
			action="?/create"
			use:enhance={({ formData, cancel }) => {
				formData.append('editorContent', editorContent);
				formData.append('parentPolicy', parentPolicy);
				if (
					fileContent?.toString().length < 0 ||
					parentPolicy?.toString().length < 0 ||
					parentPolicy == undefined
				) {
					cancel();
				}
				return async ({ result }) => {
					if (result.type === 'success') {
						switch (result.status) {
							case 200:
								switch (result.data?.status) {
									case 201:
										createdRolesByPolicy = convertCreatedRoles(result.data);
										if (
											createdRolesByPolicy !== null &&
											Object.keys(createdRolesByPolicy.created_roles).length > 0
										) {
											modalIsOpen = !modalIsOpen;
										} else {
											policyInputIsCorrect = true;
											dispatch('handleResourceRefresh');
											displayAlert('green', 'The policy was extended successfully.', 5);
										}
										resetDrawer();
										break;
									case 401:
										displayAlert('yellow', 'The request lacks valid authentication credentials.');
										break;
									case 403:
										displayAlert('yellow', 'The authenticated user lacks the necessary privilege');
										break;
									case 404:
										policyInputIsCorrect = false;
										break;
									case 409:
										displayAlert('yellow', 'Policy load already in progress, retry after a delay.');
										break;
									case 422:
										yamlSyntaxIsCorrect = false;
										break;
								}
						}
					} else if (result.type === 'redirect') {
						goto(result.location, { invalidateAll: true });
					} else if (result.type === 'error') {
						displayAlert(
							'yellow',
							'Something went wrong while sending your request, please try again!',
							5
						);
					} else {
						await applyAction(result);
					}
				};
			}}
		>
			<Button color="blue" class="w-full" type="submit" disabled={uploadIsDisabled}
				>Upload Policy</Button
			>
		</form>
	</div>
</Drawer>
