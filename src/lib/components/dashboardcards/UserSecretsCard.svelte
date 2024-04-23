<script lang="ts">
	import ResourceErrorContent from './../detailedView/ResourceErrorContent.svelte';
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
	import { EyeSlashSolid, EyeSolid } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	export let additionalClass: string;
	export let secrets: Promise<Record<string, string>>;

	const secretValuePattern = /"secretData":"([^"]+)"/;

	function unifieSecretValues(string: string) {
		const match = secretValuePattern.exec(string);
		if (match && match[1]) {
			return match[1];
		}

		return string;
	}

	function getIdentifier(string: string) {
		return string.split(':').at(-1);
	}

	const secretsShow: boolean[] = [];

	function toggleShowHidden(index: number) {
		secretsShow[index] = !secretsShow[index];
	}

	function gotoVariable(key: string) {
		const identifier = getIdentifier(key);
		goto(`/variables/${encodeURIComponent(identifier!)}`);
	}
</script>

<Card class={additionalClass}>
	<h4 class="mb-5 text-xl font-bold text-tmainl dark:text-tmaind">Secrets</h4>
	{#await secrets}
		<div class="inset-0 flex h-full flex-row items-center justify-center">
			<Spinner color="gray" />
		</div>
	{:then secretsResolved}
		<Table
			striped
			class={Object.keys(secretsResolved).length === 0 ? 'h-full' : ''}
			divClass="relative h-full overflow-x-auto rounded border !border-gray-100 dark:!border-gray-600 dark:bg-bgds"
		>
			<TableHead theadClass="text-xs uppercase bg-gray-100 dark:bg-gray-700">
				<TableHeadCell class="w-1/3" padding="p-3">Variable</TableHeadCell>
				<TableHeadCell class="w-1/3" padding="p-3">Secret</TableHeadCell>
				<TableHeadCell class="w-1/12" padding=""></TableHeadCell>
			</TableHead>
			{#if Object.keys(secretsResolved).length === 0}
				<TableBody tableBodyClass="relative">
					<div class="absolute flex h-full w-full items-center justify-center">
						<p class="text-center text-lg text-tsecl dark:text-tsecd">No Avaliable Secrets</p>
					</div>
				</TableBody>
			{:else}
				<TableBody>
					{#each Object.keys(secretsResolved) as key, index}
						<TableBodyRow>
							<TableBodyCell tdClass="px-3 w-1/3 py-2">{getIdentifier(key)}</TableBodyCell>
							<TableBodyCell tdClass="px-3 text-left w-1/3 py-2">
								<div class="flex items-center" style="user-select: none">
									{#if secretsShow[index]}
										{unifieSecretValues(secretsResolved[key])}
									{:else}
										********
									{/if}
								</div>
							</TableBodyCell>
							<TableBodyCell tdClass="w-1/12 py-2">
								<div class="flex justify-around" style="user-select: none">
									{#if secretsShow[index]}
										<button
											on:click={() => {
												toggleShowHidden(index);
											}}
										>
											<EyeSlashSolid class="text-tmainl outline-none dark:text-tmaind" />
										</button>
									{:else}
										<button
											on:click={() => {
												toggleShowHidden(index);
											}}
										>
											<EyeSolid class="text-tmainl outline-none dark:text-tmaind" />
										</button>
									{/if}
									<button
										class="px-2"
										on:click={() => {
											gotoVariable(key);
										}}
										><svg
											class="h-4 w-4 text-xl text-tmainl dark:text-tmaind"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 18 18"
										>
											<path
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
											/>
										</svg></button
									>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			{/if}
		</Table>
	{:catch error}
		<ResourceErrorContent {error} message={'Unexpected error occured during fetch'} />
	{/await}
</Card>
