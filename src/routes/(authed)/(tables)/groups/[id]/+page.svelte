<script lang="ts">
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import PolicyResource from '$lib/api/policyResources';
	import type { BaseResource } from '$lib/api/baseResources';
	import RoleMembersCard from '$lib/components/detailedView/RoleMembersCard.svelte';
	import RoleMembershipsCard from '$lib/components/detailedView/RoleMembershipsCard.svelte';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import { ResourceCard } from '$lib';
	import { ClientHttpError } from '$lib/api/errors.js';

	export let data;

	let parentPolicy = new Promise<PolicyResource>(() => {});
	let owner = new Promise<BaseResource>(() => {});
	let resourceToShow = createBaseResource(data.resource);

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
	{#if data.success}
		<div class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-1 gap-5 p-5 xl:grid-cols-2">
			<ResourceCard
				title="Group Info"
				resource={resourceToShow}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>

			<ResourceCard
				title="Owner Info"
				resource={owner}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>

			<ResourceCard
				title="Parent Policy Info"
				resource={parentPolicy}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>

			<PermissionsCard
				resource={resourceToShow}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>

			<AnnotationCard
				resource={resourceToShow}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>
			<RoleMembersCard
				title="Group Members"
				roleMembers={data.roleMembers}
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
			/>

			<RoleMembershipsCard
				title="Group Memberships"
				additionalClass="col-span-2 xl:col-span-1 2xl:col-span-2"
				resource={data.roleMemberships}
			/>
		</div>
	{/if}
</main>
