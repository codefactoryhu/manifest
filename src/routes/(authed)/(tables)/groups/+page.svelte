<script lang="ts">
	import { schemas } from '$lib/api/requests';
	import { UnifiedTableComponent } from '$lib';
	import { invalidate } from '$app/navigation';
	import { convert } from '$lib/api/requests/utils.js';

	export let data;

	const pageResourceKind = schemas.ResourceKind.Group;
	let popOverIsEnabled: boolean = true;
	let initPageIndex = 0;
	let initPageRowLimit = 12;

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
				title="Groups"
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
