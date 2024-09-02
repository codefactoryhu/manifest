<script lang="ts">
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import PolicyResource from '$lib/api/policyResources';
	import type { BaseResource } from '$lib/api/baseResources';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import { ResourceCard } from '$lib';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { Card } from 'flowbite-svelte';
	import ResourceErrorContent from '$lib/components/detailedView/ResourceErrorContent.svelte';
	import type { ResourceResponse } from '$lib/api/requests/schemas';

	export let data: {
		countdown: number;
		account: string;
		userid: string;
		userIsAdmin: boolean;
		success: boolean;
		resource: ResourceResponse | null;
		owner: ResourceResponse | null;
		parentPolicy: ResourceResponse | null;
	};

	let parentPolicy = new Promise<PolicyResource>(() => {});
	let owner = new Promise<BaseResource>(() => {});

	let resourceToShow: BaseResource;
	let errorMessage: string = '';

	if (data.resource !== null) {
		resourceToShow = createBaseResource(data.resource);
	} else {
		errorMessage =
			'The requested resource does not exist, or the authenticated user lacks the necessary privilege.';
	}

	if (data.parentPolicy == null) {
		parentPolicy = Promise.reject(new ClientHttpError(404, 'No Parent Policy.'));
	} else {
		parentPolicy = convertResource(data.parentPolicy, 'PolicyResource');
	}

	if (data.owner == null) {
		owner = Promise.reject(new ClientHttpError(404, 'No Owner Policy.'));
	} else {
		owner = convertResource(data.owner, 'BaseResource');
	}
</script>

<main class="overflow-auto">
	<div class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-1 gap-5 p-5 xl:grid-cols-2">
		{#if data.resource !== null}
			<ResourceCard
				title="Webservice Info"
				resource={resourceToShow}
				additionalClass="col-span-2 xl:col-span-1"
			/>
			<ResourceCard
				title="Owner Info"
				resource={owner}
				additionalClass="col-span-2 xl:col-span-1"
			/>

			<ResourceCard
				title="Parent Policy Info"
				resource={parentPolicy}
				additionalClass="col-span-2 xl:col-span-1"
			/>

			<PermissionsCard
				resource={resourceToShow}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>

			<AnnotationCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />
		{:else}
			<Card class={`h-96 max-w-none`}>
				<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Additional Info</h4>
				<ResourceErrorContent message={errorMessage} />
			</Card>
		{/if}
	</div>
</main>
