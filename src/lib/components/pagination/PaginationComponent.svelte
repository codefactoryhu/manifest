<script lang="ts">
	import type { BaseResource } from '$lib/api/baseResources';
	import type { Table, TableOptions } from '@tanstack/svelte-table';
	import type { Readable } from 'svelte/motion';
	import type { Writable } from 'svelte/store';
	import { setCurrentPage } from '$lib/api/requests/utils';
	import {
		ChervonDoubleLeftSolid,
		ChervonDoubleRightSolid,
		ChevronLeftOutline,
		ChevronRightOutline
	} from 'flowbite-svelte-icons';

	export let currentPage: number;
	export let limit: number;
	export let resourceLength: number;
	export let table: Readable<Table<BaseResource>>;
	export let options: Writable<TableOptions<BaseResource>>;
	export let pageLimitFromParent: number;
	export let pageIndexFromParent: number;

	let currentLimits: Array<number> = [6, 12, 18, 25, 50, 100];
	let goToPageInputString = '';

	$: start = currentPage * limit;
	$: end = currentPage + 1 === $table.getPageCount() ? resourceLength - 1 : start + limit - 1;

	function handleCurrPageInput() {
		setCurrentPage(parseInt(goToPageInputString) - 1, options, pageLimitFromParent);
		goToPageInputString = '';
	}

	function setPageSize(e: Event) {
		const target = e.target as HTMLInputElement;
		let correctedCurrentPageIndex = correctCurrentPageIndexBasedOnIncomingNewLimitValue(
			parseInt(target.value)
		);

		options.update((old) => {
			return {
				...old,
				state: {
					...old.state,
					pagination: {
						...old.state?.pagination,
						pageSize: parseInt(target.value),
						pageIndex: correctedCurrentPageIndex
					}
				}
			};
		});
		pageIndexFromParent = correctedCurrentPageIndex;
		pageLimitFromParent = parseInt(target.value);
	}

	function correctCurrentPageIndexBasedOnIncomingNewLimitValue(newLimitValue: number) {
		let correctedTotalPageNumber = Math.ceil(
			$table.getPrePaginationRowModel().rows.length / newLimitValue
		);

		return currentPage < correctedTotalPageNumber ? currentPage : correctedTotalPageNumber - 1;
	}
</script>

<div
	class="flex-wrap items-center justify-center divide-dvL300 border-t border-brl300 bg-bgls dark:border-brl500 dark:bg-bgds"
>
	<div class="flex flex-wrap items-center justify-evenly gap-y-2 p-4">
		<ul class="inline-flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-2">
			<div
				class="hidden flex-wrap items-center gap-x-2 gap-y-1 text-tmainl dark:text-white sm:inline-flex"
			>
				{#if resourceLength === 0}
					0 - 0
					<p class="text-gray-500">of</p>
					0
					<p class="text-gray-500">Rows</p>
				{:else}
					{start + 1} - {end + 1}
					<p class="text-gray-500">of</p>
					{resourceLength}
					<p class="text-gray-500">Rows</p>
				{/if}
			</div>
			<div class="flex flex-wrap items-center justify-center gap-x-1">
				<button
					type="button"
					disabled={!$table.getCanPreviousPage()}
					on:click={() => setCurrentPage(0, options, pageLimitFromParent)}
					class="bg-gray rounded-lg border border-gray-100 px-2 py-2 text-tmainl outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-gray-200 disabled:text-tsecl dark:border-gray-700 dark:bg-bgdf dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 disabled:dark:border-gray-700 disabled:dark:bg-bgds disabled:dark:text-gray-700"
					><ChervonDoubleLeftSolid size="xs" class="border-none outline-none"
					></ChervonDoubleLeftSolid></button
				>
				<button
					type="button"
					disabled={!$table.getCanPreviousPage()}
					on:click={() => setCurrentPage(currentPage - 1, options, pageLimitFromParent)}
					class="bg-gray rounded-lg border border-gray-100 px-2 py-2 text-tmainl outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-gray-200 disabled:text-tsecl dark:border-gray-700 dark:bg-bgdf dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 disabled:dark:border-gray-700 disabled:dark:bg-bgds disabled:dark:text-gray-700"
					><ChevronLeftOutline size="sm" class="border-none outline-none"
					></ChevronLeftOutline></button
				>

				{#each Array($table.getPageCount()) as dummy, idx}
					{#if currentPage - 2 < idx && currentPage > idx - 2}
						<button
							id={dummy}
							type="button"
							on:click={() => setCurrentPage(idx, options, pageLimitFromParent)}
							class="{currentPage === idx
								? 'border-blue-600 dark:border-blue-600'
								: 'border-gray-100 dark:border-gray-700'} bg-gray rounded-lg border px-3 py-1 text-tmainl outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-gray-200 disabled:text-tsecl dark:bg-bgdf dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700 disabled:dark:bg-bgds disabled:dark:text-gray-700"
							>{idx + 1}</button
						>
					{/if}
				{/each}

				<button
					type="button"
					disabled={!$table.getCanNextPage()}
					on:click={() => setCurrentPage(currentPage + 1, options, pageLimitFromParent)}
					class="bg-gray rounded-lg border border-gray-100 px-2 py-2 text-tmainl outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-gray-200 disabled:text-tsecl dark:border-gray-700 dark:bg-bgdf dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 disabled:dark:border-gray-700 disabled:dark:bg-bgds disabled:dark:text-gray-700"
					><ChevronRightOutline size="sm" class="border-none outline-none"
					></ChevronRightOutline></button
				>
				<button
					type="button"
					disabled={!$table.getCanNextPage()}
					on:click={() => setCurrentPage($table.getPageCount() - 1, options, pageLimitFromParent)}
					class="bg-gray rounded-lg border border-gray-100 px-2 py-2 text-tmainl outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-gray-200 disabled:text-tsecl dark:border-gray-700 dark:bg-bgdf dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 disabled:dark:border-gray-700 disabled:dark:bg-bgds disabled:dark:text-gray-700"
					><ChervonDoubleRightSolid
						size="xs"
						class="border-none outline-none"
						disabled={!$table.getCanNextPage()}
					></ChervonDoubleRightSolid></button
				>
			</div>
			<div class="flex flex-wrap items-center justify-around gap-x-6 gap-y-2 px-4">
				<select
					disabled={resourceLength === 0}
					value={$table.getState().pagination.pageSize}
					class="rounded-lg border border-gray-300 bg-gray-50 text-tmainl focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					on:change={setPageSize}
				>
					{#each currentLimits as value}<option {value} class="text-md text-tmainl dark:text-white">
							Show {value}
						</option>{/each}
				</select>
				<!-- Page jumper -->
				<div class="hidden flex-wrap items-center gap-x-4 text-tmainl dark:text-white sm:flex">
					Page
					<form on:submit|preventDefault={handleCurrPageInput}>
						<input
							class="w-20 rounded-lg border border-gray-300 bg-gray-50 text-tmainl focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
							type="number"
							placeholder="#"
							disabled={resourceLength === 0}
							id="goToPageInputValue"
							bind:value={goToPageInputString}
							min="1"
							max={$table.getPageCount()}
							required
						/>
						<button
							type="submit"
							class="bg-gray rounded-lg border border-gray-100 px-2 py-2 text-tmainl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-bgdf dark:text-white dark:hover:border-gray-500 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
							>Go to</button
						>
					</form>
				</div>
			</div>
		</ul>
	</div>
</div>
