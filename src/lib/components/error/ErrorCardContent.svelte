<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from 'flowbite-svelte';

	export let message = '';
	export let src = 'https://flowbite-admin-dashboard.vercel.app/images/illustrations/500.svg';
	export let alt = 'maintenance';
	export let showGoBackBtn = true;
</script>

<div class="justify-content flex h-max flex-col justify-center">
	<div class="mb-4 flex min-w-min flex-col items-center justify-center">
		<img class="w-1/2" {src} {alt} />
		<p
			class="mb-4 text-center text-xl font-bold tracking-tight text-tmainl dark:text-tmaind sm:text-2xl xl:text-3xl"
		>
			Something went wrong ..
		</p>
		{#if message}
			<p class="mb-4 self-center break-words text-center font-light tracking-wide">
				{message}
			</p>
		{:else}
			<p class="mb-4 text-center font-light text-gray-500 dark:text-gray-400 xl:text-lg">
				Please refresh your page or login again. If the issue persists, contact support for
				assistance.
			</p>
		{/if}
		{#if showGoBackBtn}
			<Button color="blue" on:click={() => goto('/')}>
				<svg
					class="-ml-1 mr-2 h-5 w-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						fill-rule="evenodd"
						d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/></svg
				>
				Go back home
			</Button>
		{/if}
	</div>
</div>
