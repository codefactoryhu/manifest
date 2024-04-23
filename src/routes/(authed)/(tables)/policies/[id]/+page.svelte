<script lang="ts">
	import VariableResource from '$lib/api/variableResources';
	import PolicyResource from '$lib/api/policyResources';
	import ResourceCard from '$lib/components/detailedView/ResourceCard.svelte';
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import VariableCard from '$lib/components/detailedView/VariableCard.svelte';
	import type { BaseResource } from '$lib/api/baseResources';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { schemas } from '$lib/api/requests';
	import { PolicyVersionCard } from '$lib';

	export let data;

	let parentPolicy = new Promise<PolicyResource>(() => {});
	let owner = new Promise<BaseResource>(() => {});
	let variables = new Promise<VariableResource[]>(() => {});
	let variablesCount: number;

	$: resourceToShow = createBaseResource(data.resource);

	$: if (data.variables == null) {
		// when goto navigation is used from policy to policy, this $ sign is required;
		variablesCount = 0;
		variables = Promise.reject(new ClientHttpError(404, 'No Parent Policy'));
	} else {
		variables = convertVariables(data.variables);
		variablesCount = data.variables.length;
	}

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

	function convertVariables(variables: schemas.ResourceResponse[]): Promise<VariableResource[]> {
		return new Promise((resolve, reject) => {
			try {
				const promises = variables.map((obj) => new VariableResource(obj));
				Promise.all(promises)
					.then((variableResources) => {
						resolve(variableResources);
					})
					.catch((error) => {
						reject(error);
					});
			} catch (error) {
				reject(error);
			}
		});
	}
</script>

<main class="overflow-auto">
	<div class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-1 gap-5 p-5 xl:grid-cols-2">
		<ResourceCard title="Policy Info" resource={resourceToShow} />
		<ResourceCard title="Owner Info" resource={owner} additionalClass="xl:col-start-2" />
		<ResourceCard title="Parent Policy Info" resource={parentPolicy} />
		<PermissionsCard
			resource={resourceToShow}
			additionalClass="col-span-1 row-start-6 xl:col-span-1 xl:row-start-2 xl:col-start-1 2xl:col-span-2 2xl:row-start-3 2xl:col-start-1"
		/>
		{#key resourceToShow}
			<PolicyVersionCard
				resource={resourceToShow}
				additionalClass="h-[24rem] row-start-2 xl:col-span-2 xl:row-start-3 2xl:row-start-2 "
			/>
		{/key}
		<AnnotationCard
			resource={resourceToShow}
			additionalClass=" row-start-3 xl:col-span-2 xl:row-start-4 2xl:col-span-1 2xl:row-start-1 2xl:col-start-3 "
		/>
		<VariableCard
			resource={variables}
			secrets={data.secretsValues}
			{variablesCount}
			additionalClass="row-start-5 xl:row-start-2 2xl:col-start-3 2xl:h-[24rem]"
		/>
	</div>
</main>
