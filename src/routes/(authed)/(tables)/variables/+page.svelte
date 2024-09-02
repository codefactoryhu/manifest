<script lang="ts">
	import { UnifiedTableComponent } from '$lib';
	import { invalidate } from '$app/navigation';
	import { schemas } from '$lib/api/requests/index.js';
	import { convert } from '$lib/api/requests/utils.js';

	export let data: {
		countdown: number;
		account: string;
		userid: string;
		userIsAdmin: boolean;
		success: boolean;
		data: schemas.ResourceResponse[];
	};

	const pageResourceKind: schemas.ResourceKind = schemas.ResourceKind.Variable;

	let popOverIsEnabled: boolean = true;
	let headerKeys: Array<keyof schemas.ResourceResponse> = [
		'id',
		'owner',
		'policy',
		'secretsCount',
		'permissionsCount',
		'created_at'
	];

	let userIsAdmin: boolean = data.userIsAdmin!;

	let initPageIndex: number = 0;
	let initPageRowLimit: number = 12;

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
