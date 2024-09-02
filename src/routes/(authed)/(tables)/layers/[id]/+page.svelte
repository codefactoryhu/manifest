<script lang="ts">
	import PermissionsCard from '$lib/components/detailedView/PermissionsCard.svelte';
	import AnnotationCard from '$lib/components/detailedView/AnnotationCard.svelte';
	import PolicyResource from '$lib/api/policyResources';
	import type { BaseResource } from '$lib/api/baseResources';
	import { convertResource, createBaseResource } from '$lib/api/requests/utils.js';
	import RoleMembersCard from '$lib/components/detailedView/RoleMembersCard.svelte';
	import RoleMembershipsCard from '$lib/components/detailedView/RoleMembershipsCard.svelte';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { ResourceCard } from '$lib';
	import { Card } from 'flowbite-svelte';
	import ResourceErrorContent from '$lib/components/detailedView/ResourceErrorContent.svelte';
	import { schemas } from '$lib/api/requests';
	import type {
		RoleMemberResponse,
		RoleMembershipsRequestResponse
	} from '$lib/api/requests/schemas';

	export let data: {
		countdown: number;
		account: string;
		userid: string;
		resource: schemas.ResourceResponse | null;
		owner: schemas.ResourceResponse | null;
		parentPolicy: schemas.ResourceResponse | null;
		roleMembers: Promise<schemas.RoleMemberResponse[]> | null;
		roleMemberships: Promise<schemas.RoleMembershipsRequestResponse> | null;
	};

	let parentPolicy = new Promise<PolicyResource>(() => {});
	let owner = new Promise<BaseResource>(() => {});
	let roleMembers = new Promise<RoleMemberResponse[]>(() => {});
	let roleMemberships = new Promise<RoleMembershipsRequestResponse>(() => {});

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

	if (data.roleMembers == null) {
		roleMembers = Promise.reject(new ClientHttpError(404, 'No Role Members.'));
	} else {
		roleMembers = data.roleMembers;
	}

	if (data.roleMemberships == null) {
		roleMemberships = Promise.reject(new ClientHttpError(404, 'No RoleMemberships.'));
	} else {
		roleMemberships = data.roleMemberships;
	}
</script>

<main class="overflow-auto">
	<div class="2xl:grid-cols-3 grid grid-flow-row-dense grid-cols-1 gap-5 p-5 xl:grid-cols-2">
		{#if data.resource !== null}
			<ResourceCard
				title="Layer Info"
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

			<PermissionsCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

			<AnnotationCard resource={resourceToShow} additionalClass="col-span-2 xl:col-span-1" />

			<RoleMembersCard
				title="Layer Members"
				{roleMembers}
				additionalClass="col-span-2 xl:col-span-1"
			/>

			<RoleMembershipsCard
				title="Layer Memberships"
				additionalClass="col-span-2 xl:col-span-1"
				resource={roleMemberships}
			/>
		{:else}
			<Card class={`h-96 max-w-none`}>
				<h4 class=" mb-4 text-xl font-bold text-tmainl dark:text-tmaind">Additional Info</h4>
				<ResourceErrorContent message={errorMessage} />
			</Card>
		{/if}
	</div>
</main>
