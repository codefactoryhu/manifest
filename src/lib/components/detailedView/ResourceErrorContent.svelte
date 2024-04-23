<script lang="ts">
	import type { ClientHttpError } from '$lib/api/errors';

	export let message: string = '';
	export let error: ClientHttpError | undefined = undefined;
</script>

<div class="relative h-full w-full">
	<div class="flex h-full w-full flex-col items-center justify-center">
		{#if error}
			<p class=" text-center text-lg text-tsecl dark:text-tsecd">{error.body.message}</p>
		{:else if message}
			<p class=" text-center text-lg text-tsecl dark:text-tsecd">{message}</p>
		{/if}
	</div>
</div>
