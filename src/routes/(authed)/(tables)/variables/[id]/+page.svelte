<script lang="ts">
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import SecretCard from '$lib/components/detailedView/SecretCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import PolicyResource from '$lib/api/policyResources';
	import type { BaseResource } from '$lib/api/baseResources';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { ResourceCard } from '$lib';

	export let data;

	let parentPolicy = new Promise<PolicyResource>(() => {});
	let owner = new Promise<BaseResource>(() => {});
	let userHasPermissionToUpdateSecretValue: boolean = data.userHasPermissionToUpdateSecretValue;

	$: resourceToShow = createBaseResource(data.resource);

	if (data.parentPolicy == null) {
		parentPolicy = Promise.reject(new ClientHttpError(404, 'No Parent Policy'));
	} else {
		parentPolicy = convertResource(data.parentPolicy, 'PolicyResource');
	}

	if (data.owner == null) {
		owner = Promise.reject(new ClientHttpError(404, 'No Owner Policy'));
	} else {
		owner = convertResource(data.owner, 'BaseResource');
	}
</script>

<main class="overflow-auto">
	<div class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-1 gap-5 p-5 xl:grid-cols-2">
		<ResourceCard
			title="Variable Info"
			resource={resourceToShow}
			additionalClass="col-span-2 xl:col-span-1"
		/>

		<ResourceCard title="Owner Info" resource={owner} additionalClass="col-span-2 xl:col-span-1" />

		<ResourceCard
			title="Parent Policy Info"
			resource={parentPolicy}
			additionalClass="col-span-2 xl:col-span-1"
		/>

		<PermissionsCard
			resource={resourceToShow}
			additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
		/>

		{#key data.secrets}
			<SecretCard
				additionalClass="col-span-2 xl:col-span-1"
				secrets={data.secrets}
				secretCount={data.secretsLength}
				{userHasPermissionToUpdateSecretValue}
			/>
		{/key}

		<AnnotationCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />
	</div>
</main>
