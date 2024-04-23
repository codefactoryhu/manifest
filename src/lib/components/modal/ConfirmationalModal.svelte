<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Modal } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';

	export let message: string;
	export let modalShow: boolean;
</script>

<Modal bind:open={modalShow} size="xs">
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3
			class="mb-5 flex flex-col justify-center gap-y-2 text-lg font-normal text-gray-500 dark:text-gray-400"
		>
			<p>Are you sure you want to</p>
			<b>{message}</b>
		</h3>

		<Button
			on:click={() => {
				goto('/rotate');
			}}
			color="red"
			class="me-2">Yes, I'm sure</Button
		>
		<form method="POST" action="?/rotate">
			<Button color="blue" type="submit">Rotate</Button>
		</form>
		<Button color="alternative">No, cancel</Button>
	</div>
</Modal>
