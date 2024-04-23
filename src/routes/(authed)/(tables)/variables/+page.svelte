<script lang="ts">
	import { UnifiedTableComponent } from '$lib';
	import { invalidate } from '$app/navigation';
	import { schemas } from '$lib/api/requests/index.js';
	import { convert } from '$lib/api/requests/utils.js';

	export let data;

	const pageResourceKind = schemas.ResourceKind.Variable;

	let popOverIsEnabled: boolean = true;
	let headerKeys: Array<keyof schemas.ResourceResponse> = [
		'id',
		'owner',
		'policy',
		'secretsCount',
		'permissionsCount',
		'created_at'
	];

	let initPageIndex = 0;
	let initPageRowLimit = 12;

	$: resources = convert(data.data);

	function refreshResources() {
		invalidate('data:data');
	}
</script>

{#if data.success}
	{#key resources}
		{#key initPageIndex}
			<UnifiedTableComponent
				on:handleResourceRefresh={refreshResources}
				bind:pageIndexFromParent={initPageIndex}
				bind:pageLimitFromParent={initPageRowLimit}
				{resources}
				{popOverIsEnabled}
				{pageResourceKind}
				{headerKeys}
				title="Variables"
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
