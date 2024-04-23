<script>
	import { Alert, CloseButton } from 'flowbite-svelte';
	import { alertMessage, alertColor, show, closeAlert } from './AlertStore';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
</script>

{#if $show}
	<Alert color={$alertColor} class="fixed left-1/2 z-60 mt-10 -translate-x-1/2 transform p-5 ">
		<div class="flex items-center gap-3">
			<InfoCircleSolid slot="icon" class="h-4 w-4" />
			<p>{$alertMessage}</p>
			<CloseButton on:click={closeAlert} />
		</div>
	</Alert>
{/if}
