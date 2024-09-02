<script lang="ts">
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import RestrictionCard from '$lib/components/detailedView/RestrictionCard.svelte';
	import type { BaseResource } from '$lib/api/baseResources';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { ResourceCard, RoleMembersCard } from '$lib';
	import { Card } from 'flowbite-svelte';
	import ResourceErrorContent from '$lib/components/detailedView/ResourceErrorContent.svelte';
	import { schemas } from '$lib/api/requests';

	export let data: {
		countdown: number;
		account: string;
		userid: string;
		success: boolean;
		resource: schemas.ResourceResponse | null;
		owner: schemas.ResourceResponse | null;
		roleMembers: Promise<schemas.RoleMemberResponse[]> | null;
	};

	let owner = new Promise<BaseResource>(() => {});

	let resourceToShow: BaseResource;
	let errorMessage: string = '';

	if (data.resource !== null) {
		resourceToShow = createBaseResource(data.resource);
	} else {
		errorMessage =
			'The requested resource does not exist, or the authenticated user lacks the necessary privilege.';
	}

	if (data.owner == null) {
		owner = Promise.reject(new ClientHttpError(404, 'No Owner Policy.'));
	} else {
		owner = convertResource(data.owner, 'BaseResource');
	}
</script>

<main class="overflow-auto">
	<div
		class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-2 gap-5 p-5 md:grid-cols-2 xl:grid-cols-2"
	>
		{#if data.resource !== null}
			<ResourceCard
				title="User Info"
				resource={resourceToShow}
				additionalClass="col-span-2 xl:col-span-1"
			/>

			<ResourceCard
				title="Owner Info"
				resource={owner}
				additionalClass="col-span-2 xl:col-span-1"
			/>

			<PermissionsCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

			<RestrictionCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

			<AnnotationCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />
			{#if data.roleMembers !== null}
				<RoleMembersCard
					title="User Memberships"
					roleMembers={data.roleMembers}
					additionalClass="col-span-2 xl:col-span-1"
				/>
			{/if}
		{:else}
			<Card class={`h-96 max-w-none`}>
				<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Additional Info</h4>
				<ResourceErrorContent message={errorMessage} />
			</Card>
		{/if}
	</div>
</main>
