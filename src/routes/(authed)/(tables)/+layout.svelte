<script lang="ts">
	import { page } from '$app/stores';
	import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import { AngleRightSolid } from 'flowbite-svelte-icons';

	$: url = $page.url.pathname; // example: resources/xyz%2Fone%2Ftwo
	$: breadCrumbArrayInit = sliceUrlBasedOnSlash(url); // example: ['resources', 'xyz/one/two']
	$: breadCrumbArrayPlusSplittedIdentifiersArray = splitValues(breadCrumbArrayInit); // example: ['resources', 'xyz', 'one', 'two']

	function sliceUrlBasedOnSlash(input: string): string[] {
		const regex = /\/([^\\/]+)/g;
		const matches = input.match(regex);

		if (matches) {
			// Remove the leading '/' and handle percent-encoded characters
			return matches.map((match) => {
				try {
					return decodeURIComponent(match.slice(1));
				} catch (error) {
					// Fallback to the original value if decoding fails
					return match.slice(1);
				}
			});
		} else {
			return [];
		}
	}

	function splitValues(inputArray: string[]): string[] {
		const result: string[] = [];

		inputArray.forEach((item) => {
			const subValues = item.split('/').map((subItem) => subItem.trim());
			result.push(...subValues);
		});

		return result;
	}

	function capitalizeFirstChar(resourceTitle: string) {
		return resourceTitle.charAt(0).toUpperCase() + resourceTitle.slice(1);
	}

	function getResourceKind(resourceId: string) {
		return resourceId.split('/').at(1);
	}
</script>

<main class="flex h-full flex-col">
	<div
		class="align-center flex w-full flex-wrap justify-between border-b border-b-brl300 bg-bgls px-4 py-2 dark:border-b-brl500 dark:bg-bgds"
	>
		<Breadcrumb olClass="pl-2 flex flex-wrap items-center">
			{#each breadCrumbArrayPlusSplittedIdentifiersArray as breadCrumb, index}
				{#if index === 0}
					<BreadcrumbItem
						linkClass="text-gray-500 dark:text-gray-400 font-semibold hover:text-htl dark:hover:text-htd"
						href={`/${getResourceKind(url)}`}
					>
						<!-- Define the icon before the first BreadCrumb -->
						<svelte:fragment slot="icon">
							{''}
						</svelte:fragment>
						{capitalizeFirstChar(breadCrumb)}</BreadcrumbItem
					>
				{:else}
					<BreadcrumbItem spanClass="font-semibold text-black dark:text-white">
						<!-- Define the icons for the rest BreadCrumbs -->
						<svelte:fragment slot="icon">
							<AngleRightSolid
								class="h-2 text-tsecl outline-none transition duration-75 dark:text-tsecd"
							/>
						</svelte:fragment>
						{breadCrumb}</BreadcrumbItem
					>
				{/if}
			{/each}
		</Breadcrumb>
	</div>
	<slot />
</main>
