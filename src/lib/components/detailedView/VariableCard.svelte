<script lang="ts">
	import { goto } from '$app/navigation';
	import type VariableResource from '$lib/api/variableResources';
	import { Card } from 'flowbite-svelte';
	import ResourceErrorContent from './ResourceErrorContent.svelte';
	import { EyeSlashSolid, EyeSolid } from 'flowbite-svelte-icons';

	export let additionalClass: string = '';
	export let resource: Promise<VariableResource[]> | null;
	export let errorMessage: string =
		'No Variables for this policy, or user lacks the necessary privilege.';
	export let variablesCount: number;
	export let secrets: string[] | null;

	let secretIsHidden: boolean[] = new Array(variablesCount ? variablesCount : 0).fill(false);

	function blurrButton(index: number): void {
		const icon = document.getElementById(`eye-button-${index}`) as HTMLElement;
		icon.blur();
	}

	function toggleShowHidden(index: number): void {
		secretIsHidden[index] = !secretIsHidden[index];
		blurrButton(index);
	}

	function gotoVariable(resource: VariableResource): void {
		const identifier = resource.identifier;
		goto(`/variables/${encodeURIComponent(identifier!)}`);
	}
</script>

<Card class={`h-96 max-w-none ${additionalClass}`}>
	{#if secrets !== null && resource !== null}
		{#await resource then resourceResolved}
			<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Variables of Policy</h4>
			<div
				class="flex h-full flex-col gap-2 overflow-auto rounded-md border-2 border-gray-100 p-2 dark:border-gray-500"
			>
				{#if resourceResolved.length !== 0}
					{#each resourceResolved as resource, index}
						<div
							class="flex content-center justify-between rounded-md border border-gray-100 bg-bglf p-2 dark:border-gray-500 dark:bg-bgdf"
						>
							<div class="flex w-11/12 flex-wrap justify-between text-center">
								<p>{resource.identifier}</p>
								{#if secrets[index] !== undefined}
									{#if secretIsHidden[index]}
										<div class="flex items-center gap-4 pt-1">
											<p>{secrets[index]}</p>
											<button on:click={() => toggleShowHidden(index)}>
												<EyeSlashSolid
													class="m-0 p-0 text-tmainl outline-none dark:text-tmaind"
													id={`eye-button-${index}`}
													style="user-select: none"
												/>
											</button>
										</div>
									{:else}
										<div class="flex items-center gap-4">
											<p class="pt-1">**********</p>
											<button on:click={() => toggleShowHidden(index)}>
												<EyeSolid
													class="m-0 p-0 text-tmainl outline-none dark:text-tmaind"
													id={`eye-button-${index}`}
													style="user-select: none"
												/>
											</button>
										</div>
									{/if}
								{/if}
							</div>
							<button on:click={() => gotoVariable(resource)}>
								<svg
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
								</svg>
							</button>
						</div>
					{/each}
				{:else}
					<ResourceErrorContent message={errorMessage} />
				{/if}
			</div>
		{:catch error}
			<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Variables of Policy</h4>
			<ResourceErrorContent {error} />
		{/await}
	{:else}
		<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Variables of Policy</h4>
		<ResourceErrorContent message={errorMessage} />{/if}
</Card>
