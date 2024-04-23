<script lang="ts">
	import type { schemas } from '$lib/api/requests';
	import { AccordionItem, Accordion, Card, Textarea } from 'flowbite-svelte';

	import ResourceErrorCard from './ResourceErrorContent.svelte';

	export let errorMessage: string = 'No Policy Versions ';
	export let additionalClass: string = '';
	export let resource: schemas.ResourceResponse;

	let sortedResource: schemas.PolicyVersionResource[] = sortResourceByPolicyVersion();

	function sortResourceByPolicyVersion(): schemas.PolicyVersionResource[] {
		if (resource.policy_versions) {
			let policyVersionResource = resource.policy_versions;

			return policyVersionResource
				.slice()
				.sort((a, b) => b.version - a.version) as schemas.PolicyVersionResource[];
		} else {
			return [] as schemas.PolicyVersionResource[];
		}
	}
</script>

<Card class={`h-96 max-w-none ${additionalClass}`}>
	<h4 class="mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Policy Version</h4>
	{#if sortedResource.length > 0}
		<Accordion multiple class="mb-1 h-full items-start overflow-auto rounded-xl border-b border-t">
			{#each sortedResource as policyVersion}
				<AccordionItem class="mb-1 h-full rounded-md border-t" classActive="text-blue-500">
					<div slot="header" class="flex flex-wrap justify-between gap-x-8 gap-y-2">
						<div class="flex flex-wrap gap-2">
							<p class=" text-tmainl dark:text-tmaind">Version:</p>
							<p class="pr-2">{policyVersion.version}</p>
						</div>
						<div class="flex flex-wrap gap-2">
							<p class=" text-tmainl dark:text-tmaind">Role:</p>
							<p class="pr-2">{policyVersion.role}</p>
						</div>
						<div class="flex flex-wrap gap-2">
							<p class=" text-tmainl dark:text-tmaind">Created at:</p>
							<p class="pr-2">{policyVersion.created_at_date}</p>
						</div>
					</div>
					<Textarea
						unWrappedClass="p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 resize-none"
						disabled
						class="h-80"
						bind:value={policyVersion.policy_text}
					></Textarea>
				</AccordionItem>
			{/each}
		</Accordion>
	{:else}
		<ResourceErrorCard message={errorMessage} />
	{/if}
</Card>
