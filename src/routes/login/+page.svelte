<script lang="ts">
	import { displayAlert } from '$lib/components/alert/AlertStore';
	import { goto } from '$app/navigation';
	import { Card, DarkMode, Input, Label } from 'flowbite-svelte';
	import ConjurLogo from '$lib/assets/ConjurLogo.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { handleYamlTheme } from '$lib/api/requests/utils';

	let isLoading = false;
</script>

<main class="h-full w-full">
	<div
		class="pt:mt-0 mx-auto flex h-screen flex-wrap items-center justify-center gap-x-16 px-4 pb-8 pt-8 dark:bg-gray-900"
	>
		<div class="flex flex-col px-8 lg:items-start">
			<div
				class="flex flex-wrap items-center justify-center gap-4 text-3xl font-semibold dark:text-white"
			>
				<div class="h-11 w-11">
					<ConjurLogo />
				</div>
				<span class="text-center">Manifest</span>
			</div>
			<div
				class="dark:text-w max-w-md pb-6 pt-6 text-center text-xl font-semibold dark:text-white lg:text-left"
			>
				The right tool of handling secrets and resources.
			</div>
		</div>
		<Card
			size="lg"
			padding="xl"
			class="w-full min-w-fit max-w-md space-y-2 rounded-lg bg-white p-6 shadow dark:bg-gray-800 sm:space-y-8 sm:p-8"
		>
			<div class="flex flex-wrap justify-between">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Sign in to platform</h1>
				<div class="hidden sm:flex">
					<button on:click={handleYamlTheme}>
						<DarkMode
							size="sm"
							btnClass=" rounded-lg px-2 py-2  text-tsecl hover:bg-hlbg hover:text-tmainl dark:hover:text-tmaind focus:outline-none dark:text-tsec dark:hover:bg-hdbg dark:focus:ring-ringl"
						/>
					</button>
				</div>
			</div>

			<form
				class="mt-8 space-y-2 md:space-y-6"
				method="POST"
				action="?/login"
				use:enhance={({ formData, cancel }) => {
					const { account, userid, password } = Object.fromEntries(formData);
					if (
						account?.toString().length < 0 ||
						userid?.toString().length < 0 ||
						password?.toString().length < 0
					) {
						cancel();
					}
					return async ({ result }) => {
						isLoading = true;
						if (result.type === 'redirect') {
							goto(result.location, { invalidateAll: true });
						} else if (result.type === 'error') {
							displayAlert('yellow', 'Authorization failed, try again', 5);
							isLoading = false;
						} else {
							await applyAction(result);
							isLoading = false;
						}
					};
				}}
			>
				<div>
					<Label for="account" class="mb-2">Account</Label>
					<Input
						type="text"
						name="account"
						id="account"
						placeholder="Your account name"
						autocomplete="off"
						required
					/>
				</div>
				<div>
					<Label for="userid" class="mb-2">Username</Label>
					<Input
						type="text"
						name="userid"
						id="userid"
						placeholder="Your username"
						autocomplete="username"
						required
					/>
				</div>
				<div>
					<Label for="password" class="mb-2">Password</Label>
					<Input
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						autocomplete="Your password"
						required
					/>
				</div>
				<div class="flex items-center justify-between">
					<button
						disabled={isLoading}
						type="submit"
						class="text-normal flex flex-wrap items-center gap-x-2 rounded-lg border-gray-200 bg-blue-700 px-5 py-2.5 text-sm text-tmaind hover:bg-blue-800 focus:outline-none dark:border-blue-700 dark:text-white dark:hover:bg-blue-800 dark:focus:ring-gray-700"
						>Login</button
					>
					{#if isLoading}
						<svg
							aria-hidden="true"
							class="h-6 w-6 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							><path
								d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
								fill="currentColor"
							/><path
								d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
								fill="currentFill"
							/></svg
						>
					{/if}
				</div>
			</form>
		</Card>
	</div>
</main>
