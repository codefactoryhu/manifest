<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import AlertComponent from '$lib/components/alert/AlertComponent.svelte';
	$: currentUrl = $page.url.pathname;
</script>

<div
	class="h-full w-full {currentUrl.startsWith('/login') || $page.status !== 200 ? 'pt-0' : 'pt-16'}"
>
	<AlertComponent />
	<slot />
</div>
