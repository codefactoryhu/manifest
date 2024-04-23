<script lang="ts">
	import type { ClientHttpError } from '$lib/api/errors';

	export let error: ClientHttpError;
	export let resourceId: string;
</script>

{#if error.status == 404}
	<div
		class="absolute inset-0 flex flex-col items-center justify-center p-5 text-tsecl dark:text-tsecd"
	>
		<h4>Resource not found.</h4>
		<br />
		<p>{resourceId} not found on your account, or you don't have acces for it</p>
	</div>
{:else}
	<div class="absolute inset-0 flex flex-row items-center justify-center p-5">
		<div>
			Something went wrong. Please try again. If the issue persists, contact support for assistance.
		</div>
	</div>
{/if}
