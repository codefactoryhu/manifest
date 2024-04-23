<script lang="ts">
	import { goto } from '$app/navigation';
	import { ResourceIcon } from '$lib';
	import { ResourceKind } from '$lib/api/requests/schemas';
	import { getColorClassForSmallCards, makeItPlural } from '$lib/api/requests/utils';
	export let resourceKind: ResourceKind;
	export let resourceCount: number = 0;
</script>

<button
	type="button"
	class="card 2xl:order-1 2xl:col-span-1 relative order-1 col-span-2 flex min-w-min cursor-pointer flex-col items-center overflow-hidden rounded-lg border bg-white p-2 text-center shadow-md dark:bg-bgds md:col-span-1 lg:col-span-2 {getColorClassForSmallCards(
		resourceKind
	)}"
	on:click={() => goto(`${makeItPlural(resourceKind, false)}`)}
>
	<ResourceIcon
		background={true}
		{resourceKind}
		class="h-10 w-10 rounded-md p-2 text-white outline-none transition duration-75 "
	/>
	<h5 class="mt-2 text-tmainl dark:text-tmaind">
		<span class="font-medium">{resourceCount}</span>
	</h5>
	<p class="text-tsecl dark:text-tsecd">
		{makeItPlural(resourceKind, true)}
	</p>
</button>
