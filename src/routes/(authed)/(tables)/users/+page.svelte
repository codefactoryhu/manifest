<script lang="ts">
	import { schemas } from '$lib/api/requests';
	import { UnifiedTableComponent } from '$lib';
	import { invalidate } from '$app/navigation';
	import { convert } from '$lib/api/requests/utils.js';
	import type { ResourceResponse } from '$lib/api/requests/schemas';

	export let data: {
		countdown: number;
		account: string;
		userid: string;
		userIsAdmin: boolean;
		success: boolean;
		data: ResourceResponse[];
	};

	const pageResourceKind: schemas.ResourceKind = schemas.ResourceKind.User;

	let headerKeys: Array<keyof schemas.ResourceResponse> = ['id', 'owner', 'created_at'];
	let popOverIsEnabled: boolean = true;
	let initPageIndex: number = 0;
	let initPageRowLimit: number = 12;

	let userIsAdmin: boolean = data.userIsAdmin!;

	$: resources = data.data;
	$: convertedResources = convert(resources);

	function refreshResources() {
		invalidate('data:data');
	}
</script>

{#if data.success}
	{#key convertedResources}
		{#key initPageIndex}
			<UnifiedTableComponent
				on:handleResourceRefresh={refreshResources}
				bind:pageIndexFromParent={initPageIndex}
				bind:pageLimitFromParent={initPageRowLimit}
				resources={convertedResources}
				{popOverIsEnabled}
				{pageResourceKind}
				{headerKeys}
				title="Users"
				{userIsAdmin}
			></UnifiedTableComponent>
		{/key}
	{/key}
{:else}
	<div
		class="absolute inset-0 flex flex-row items-center justify-center text-tsecl dark:text-tsecd"
	>
		<div>
			Something went wrong. Please refresh your page or login again. If the issue persists, contact
			support for assistance.
		</div>
	</div>
{/if}
