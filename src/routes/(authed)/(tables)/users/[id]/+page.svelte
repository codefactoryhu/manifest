<script lang="ts">
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import RestrictionCard from '$lib/components/detailedView/RestrictionCard.svelte';
	import RoleMembershipsCard from '$lib/components/detailedView/RoleMembershipsCard.svelte';
	import type { BaseResource } from '$lib/api/baseResources';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { ResourceCard } from '$lib';

	export let data;

	let owner = new Promise<BaseResource>(() => {});
	$: resourceToShow = createBaseResource(data.resource);

	if (data.owner == null) {
		owner = Promise.reject(new ClientHttpError(404, 'No Owner Policy'));
	} else {
		owner = convertResource(data.owner, 'BaseResource');
	}
</script>

<main class="overflow-auto">
	<div
		class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-2 gap-5 p-5 md:grid-cols-2 xl:grid-cols-2"
	>
		<ResourceCard
			title="User Info"
			resource={resourceToShow}
			additionalClass="col-span-2 xl:col-span-1"
		/>

		<ResourceCard title="Owner Info" resource={owner} additionalClass="col-span-2 xl:col-span-1" />

		<PermissionsCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

		<RestrictionCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

		<AnnotationCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

		<RoleMembershipsCard
			title="User Memberships"
			additionalClass="col-span-2 xl:col-span-1"
			resource={data.roleMemberships}
		/>
	</div>
</main>
