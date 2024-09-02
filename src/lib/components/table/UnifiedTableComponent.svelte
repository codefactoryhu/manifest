<script lang="ts">
	import { BaseResource } from '$lib/api/baseResources';
	import { schemas } from '$lib/api/requests';
	import { rankItem } from '@tanstack/match-sorter-utils';
	import {
		type ColumnDef,
		type FilterFn,
		type SortDirection,
		type TableOptions,
		type Header,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getFacetedUniqueValues,
		getFacetedRowModel,
		getPaginationRowModel,
		createSvelteTable,
		flexRender
	} from '@tanstack/svelte-table';
	import {
		Heading,
		Search,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import {
		EyeSlashSolid,
		EyeSolid,
		FilterOutline,
		FilterSolid,
		QuestionCircleSolid,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';
	import { exportCsV, exportXlsx } from '$lib/api/exportToCsvXlsx';
	import {
		CreatePolicyDrawer,
		DeleteConfirmationDrawer,
		PaginationComponent,
		SmartTableCell,
		SvelteSelectHandler
	} from '$lib';
	import { setCurrentPage } from '$lib/api/requests/utils';
	import { writable } from 'svelte/store';

	export let headerKeys: string[] = ['id', 'owner', 'policy', 'created_at']; // by default
	export let pageResourceKind: schemas.ResourceKind;
	export let resources: BaseResource[];
	export let pageIndexFromParent: number;
	export let pageLimitFromParent: number;
	export let popOverIsEnabled: boolean;
	export let title: string;
	export let userIsAdmin: boolean;

	const globalFilterFn: FilterFn<BaseResource> = (row, columnId, value, addMeta) => {
		if (Array.isArray(value)) {
			if (value.length === 0) return true;
			return value.includes(row.getValue(columnId));
		}

		// Rank the item
		const itemRank = rankItem(row.getValue(columnId), value);

		// Store the itemRank info
		addMeta({
			itemRank
		});

		// Return if the item should be filtered in/out
		return itemRank.passed;
	};

	const defaultColumns: ColumnDef<BaseResource>[] = [
		{
			id: 'id',
			accessorKey: 'id',
			header: 'ID',
			cell: (info) => info.row.original.identifier,
			filterFn: globalFilterFn,
			size: 96,
			minSize: 80
		},
		{
			id: 'owner',
			accessorKey: 'owner',
			header: 'OWNER',
			cell: (info) => info.row.original.ownerIdentifier,
			filterFn: globalFilterFn,
			size: 96
		},
		{
			id: 'policy',
			accessorKey: 'policy',
			header: 'POLICY',
			cell: (info) =>
				info.row.original.parentIdentifier ? info.row.original.parentIdentifier : 'N/A',
			filterFn: globalFilterFn,
			size: 96
		},
		{
			id: 'secretsCount',
			accessorKey: 'secretsCount',
			header: 'SECRETSCOUNT',
			cell: (info) => (info.row.original.secretsCount ? info.row.original.secretsCount : 0),
			filterFn: globalFilterFn,
			size: 40
		},
		{
			id: 'permissionsCount',
			accessorKey: 'permissionsCount',
			header: 'PERMISSIONSCOUNT',
			cell: (info) => (info.row.original.permissionsCount ? info.row.original.permissionsCount : 0),
			filterFn: globalFilterFn,
			size: 40
		},
		{
			id: 'created_at',
			accessorKey: 'created_at',
			header: 'CREATED AT',
			cell: (info) => info.row.original.formattedDate,
			filterFn: globalFilterFn,
			size: 64
		}
	];

	const resourceBasedColumns = defaultColumns.filter((column) => headerKeys.includes(column.id!));

	let searchParam: string = '';
	let deletableItemId: string = '';
	let deletableItemParent: string = '';
	let globalFilter: string = '';

	let paginationIsVisible: boolean = true;
	let filterIsActivated: boolean = false;
	let policyDrawerHidden: boolean = true;
	let deleteDrawerIsHidden: boolean = true;

	/* Handle Style */
	let allPaddingBetweenCells: string = 'px-1';
	let actionCellWidth: string = 'w-20';
	let firstCellWidth: string = '!w-3';

	function getCellCentered(header: Header<BaseResource, unknown>) {
		switch (header.column.columnDef.header) {
			case 'SECRETSCOUNT':
			case 'PERMISSIONSCOUNT':
				return ' text-center';
			default:
				return ''; // Default width if no matching header
		}
	}

	const options = writable<TableOptions<BaseResource>>({
		data: resources,
		columns: resourceBasedColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: globalFilterFn,
		state: {
			globalFilter,
			pagination: {
				pageSize: pageLimitFromParent,
				pageIndex: pageIndexFromParent
			}
		},
		enableGlobalFilter: true
	});

	const table = createSvelteTable(options);

	let headerGroups = $table.getHeaderGroups();

	$: currentPage = $table.getState().pagination.pageIndex;
	$: limit = $table.getState().pagination.pageSize;
	$: resourceLength = $table.getPrePaginationRowModel().rows.length;
	$: displayStart = currentPage * limit + 1;

	function setGlobalFilter(filter: string) {
		globalFilter = filter;
		options.update((old) => {
			return {
				...old,
				state: {
					...old.state,
					globalFilter: filter
				}
			};
		});
	}
	function resetGlobalFilter() {
		$table.getHeaderGroups().map((headerArr) => {
			headerArr.headers.map((columnObject) => {
				columnObject.column.setFilterValue('');
			});
		});
	}

	function getSortSymbol(isSorted: boolean | SortDirection) {
		return isSorted ? (isSorted === 'asc' ? '🔼' : '🔽') : '';
	}

	$: handleSearch(searchParam);
	function handleSearch(filter: string) {
		setGlobalFilter(filter);
	}

	function replaceSpecialCharsWithUnderscore(
		inputString?: unknown,
		rowIndex?: number,
		cellIndex?: number
	): string {
		if (inputString !== undefined || rowIndex !== undefined || cellIndex !== undefined) {
			if (typeof inputString === 'string') {
				const resultString = inputString.replace(/[\\/@]/g, '_');
				return resultString + `_${rowIndex}_${cellIndex}`;
			} else {
				throw new Error('Inputs can not be undefined.');
			}
		} else {
			return 'undefined_id';
		}
	}

	function replaceSpecialCharacters(inputString: string): string {
		if (inputString !== undefined) {
			// Define a regular expression to match special characters
			const specialCharsRegex = /[^\w\d]/g;
			// Replace special characters with underscores
			const resultString = inputString.replace(specialCharsRegex, '_');
			return resultString;
		} else {
			return 'undefined';
		}
	}

	function getCorrectedPageIndexWhenItemsDeleted() {
		let pageIndexAfterDelete = Math.ceil(
			($table.getPrePaginationRowModel().rows.length - 1) / limit
		);

		let correction = pageIndexAfterDelete == 0 ? 1 : pageIndexAfterDelete;

		return $table.getPageCount() <= correction
			? $table.getState().pagination.pageIndex
			: correction - 1;
	}

	function handleDeleteButton(
		resourceId?: string,
		parentIdentifier?: string,
		pageResourceKind?: string
	) {
		deleteDrawerIsHidden = false;
		pageLimitFromParent = limit;

		if (
			(resourceId && parentIdentifier) ||
			(!parentIdentifier && resourceId == 'root') ||
			(resourceId && pageResourceKind == 'user')
		) {
			deletableItemParent = 'root';
			deletableItemId = resourceId;
		}
	}

	function refreshCurrentPage() {
		pageIndexFromParent = getCorrectedPageIndexWhenItemsDeleted();
	}

	function tooglePaginationIsVisibleBtn() {
		paginationIsVisible = !paginationIsVisible;
	}

	function tooglePopOverIsActivated() {
		popOverIsEnabled = !popOverIsEnabled;
	}

	function toogleFilterIsActivated() {
		filterIsActivated = !filterIsActivated;
		resetGlobalFilter();
	}

	function getCsvExport() {
		exportCsV($table, title, true);
	}

	function getXlsxExport() {
		exportXlsx($table, title, true);
	}
</script>

<CreatePolicyDrawer bind:policyDrawerHidden on:handleResourceRefresh />

<DeleteConfirmationDrawer
	on:handleResourceRefresh
	on:handleResourceRefresh={refreshCurrentPage}
	bind:deleteDrawerIsHidden
	{deletableItemId}
	parentPolicy={deletableItemParent}
	deletableResourceKind={pageResourceKind}
/>

<div class="bg-bgls dark:bg-bgds">
	<div class="flex px-2">
		<Heading
			tag="h1"
			customSize="text-2xl"
			color="text-tmainl dark:text-tmaind"
			class="flex flex-wrap items-center justify-center gap-2 px-2 py-2 pb-2 font-semibold md:justify-between"
		>
			<div class="flex flex-wrap items-center justify-center gap-y-2 pl-2 md:justify-between">
				<div>
					<Search placeholder="Search all columns ..." bind:value={searchParam}></Search>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-center md:justify-between">
				<div class="flex flex-wrap items-center justify-center px-2 py-1">
					{#if filterIsActivated}
						<!-- Filter is visible -->
						<button class="p-1">
							<FilterSolid
								on:click={toogleFilterIsActivated}
								class="h-8 w-8 rounded-md px-2 py-2 text-htl hover:bg-hlbg focus:outline-none dark:bg-transparent"
							></FilterSolid>
						</button>
					{:else}
						<button class="p-1">
							<!-- Filter is not visible -->
							<FilterOutline
								on:click={toogleFilterIsActivated}
								class="h-8 w-8  rounded-md px-2 py-2 text-tsecl hover:bg-hlbg focus:outline-none dark:text-tmaind dark:hover:bg-hdbg "
							></FilterOutline>
						</button>
					{/if}
					{#if popOverIsEnabled}
						<button class="p-1">
							<!-- PopOver is active -->
							<QuestionCircleSolid
								on:click={tooglePopOverIsActivated}
								class="h-8 w-8 rounded-md px-2 py-2 text-htl hover:bg-hlbg focus:outline-none dark:bg-transparent "
							/>
						</button>
					{:else}
						<button class="p-1">
							<!-- PopOver is inactive -->
							<QuestionCircleSolid
								on:click={tooglePopOverIsActivated}
								class="h-8 w-8 rounded-md  px-2 py-2 text-tsecl hover:bg-hlbg focus:outline-none dark:text-tmaind dark:hover:bg-hdbg"
							/>
						</button>
					{/if}
					<div class="sm:hidden">
						{#if paginationIsVisible}
							<!-- Pagination is visible -->
							<button class="p-1">
								<EyeSolid
									class="h-8 w-8 rounded-md px-2 py-2 text-tsecl hover:bg-hlbg hover:text-blue-900 focus:outline-none dark:text-tmaind dark:hover:bg-hdbg dark:hover:text-blue-600"
									on:click={tooglePaginationIsVisibleBtn}
									style="user-select: none"
								></EyeSolid>
							</button>
						{:else}
							<!-- Pagination is hidden -->
							<button class="p-1">
								<EyeSlashSolid
									class="h-8 w-8  rounded-md px-2 py-2 text-htl hover:bg-hlbg hover:text-blue-900 focus:outline-none dark:bg-transparent dark:hover:text-blue-600 "
									on:click={tooglePaginationIsVisibleBtn}
									style="user-select: none"
								></EyeSlashSolid>
							</button>
						{/if}
					</div>
					<div class="px-1">
						<button
							disabled={$table.getRowModel().rows && $table.getRowModel().rows.length === 0}
							id="export-menu"
							class="text-normal flex flex-wrap items-center gap-x-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-tmainl hover:bg-gray-100 focus:outline-none dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
							>Export</button
						>
						<Dropdown
							triggeredBy="#export-menu"
							containerClass="border z-50"
							headerClass="overflow-hidden rounded-t-md"
							footerClass="overflow-hidden rounded-b-md"
						>
							<DropdownItem
								on:click={getXlsxExport}
								defaultClass="rounded-sm px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
								>XLSX</DropdownItem
							>
							<DropdownItem
								on:click={getCsvExport}
								defaultClass="rounded-sm px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
								>CSV</DropdownItem
							>
						</Dropdown>
					</div>
				</div>
				{#if userIsAdmin}
					<button
						on:click={() => {
							policyDrawerHidden = false;
						}}
						class="text-normal flex flex-wrap items-center gap-x-2 rounded-lg border-gray-200 bg-blue-700 px-5 py-2.5 text-sm text-tmaind hover:bg-blue-800 focus:outline-none dark:border-blue-700 dark:text-white dark:hover:bg-blue-800 dark:focus:ring-gray-700"
						>Add Resource</button
					>
				{/if}
			</div>
		</Heading>
	</div>
</div>
{#if filterIsActivated}
	<div class="bg-bgls px-2 pb-2 dark:bg-bgds">
		<div
			class="grid grid-cols-6 gap-3 rounded-lg border bg-bglf p-1 dark:border-gray-700 dark:bg-transparent"
		>
			{#each headerGroups as headerGroup}
				{#each headerGroup.headers as header}
					<div class="col-span-6 sm:col-span-3 md:col-span-3">
						<SvelteSelectHandler
							{table}
							column={header.column}
							on:setCurrentPage={() => setCurrentPage(0, options, pageLimitFromParent)}
						/>
					</div>
				{/each}
			{/each}
		</div>
	</div>
{/if}

<Table
	hoverable={true}
	divClass="relative grow overflow-auto border-gray-200 bg-bgls bg-gray-50 dark:border-gray-500 dark:bg-bgds dark:bg-gray-900"
>
	<TableHead theadClass="text-xs sticky top-0">
		<TableHeadCell padding={'bg-bglf dark:bg-bgdf h-6 pl-2 !text-gray-400 ' + firstCellWidth}
			>#</TableHeadCell
		>
		{#each $table.getHeaderGroups() as headerGroup}
			{#each headerGroup.headers as header}
				<TableHeadCell
					padding={'h-6 bg-bglf dark:bg-bgdf ' +
						`w-${header.getSize()} ` +
						allPaddingBetweenCells +
						getCellCentered(header)}
				>
					{#if !header.isPlaceholder}
						<button
							class:is-disabled={!header.column.getCanSort()}
							disabled={!header.column.getCanSort()}
							on:click={header.column.getToggleSortingHandler()}
						>
							<svelte:component
								this={flexRender(header.column.columnDef.header, header.getContext())}
							></svelte:component>
							<span>
								{getSortSymbol(header.column.getIsSorted())}
							</span>
						</button>
					{/if}
				</TableHeadCell>
			{/each}
			<TableHeadCell padding={'bg-bglf dark:bg-bgdf h-6 ' + actionCellWidth}>ACTION</TableHeadCell>
		{/each}
	</TableHead>

	{#if $table.getRowModel().rows && $table.getRowModel().rows.length === 0}
		{#if searchParam.length !== 0 || $table.getState().columnFilters.length !== 0}
			<div class="absolute inset-5 flex flex-col items-center justify-center p-5">
				<p class="text-md mb-4">It seems there are no relevant results with these conditions.</p>

				<div class="mb-4">
					<p class=" mb-2 font-semibold">Suggestions:</p>
					<ul class="list-inside list-decimal">
						<li>Double check your search for any typos or spelling errors.</li>
						<li>Try a different search term.</li>
					</ul>
				</div>
			</div>
		{:else}
			<div class="absolute inset-0 flex flex-col items-center justify-center p-5">
				<p class="text-md mb-4">This table is currently empty.</p>
			</div>
		{/if}
	{:else}
		{#key $table.getHeaderGroups()}
			<TableBody
				tableBodyClass="overflow-auto border-t border-b border-gray-200 dark:border-gray-500 dark:border-gray-700"
			>
				{#each $table.getRowModel().rows as row, rowIndex}
					<TableBodyRow>
						<TableBodyCell tdClass={'h-6 pl-2 pr-2 !text-gray-400 ' + firstCellWidth}
							>{rowIndex + displayStart}</TableBodyCell
						>
						{#each row.getVisibleCells() as cell, cellIndex}
							<TableBodyCell
								tdClass={'h-6 ' + `w-${cell.column.getSize()} ` + allPaddingBetweenCells}
							>
								<SmartTableCell
									triggerTag={replaceSpecialCharsWithUnderscore(
										replaceSpecialCharacters(cell.row.original.identifier),
										rowIndex,
										cellIndex
									)}
									{pageResourceKind}
									{popOverIsEnabled}
									{cell}
								></SmartTableCell>
							</TableBodyCell>
						{/each}
						<TableBodyCell tdClass={'h-6 ' + actionCellWidth}>
							{#if row.original.identifier !== 'admin' && row.original.identifier !== 'root' && userIsAdmin}
								<button
									color="red"
									class="text-normal mr-1 flex flex-wrap items-center gap-x-2 rounded-lg border-gray-200 bg-red-700 px-5 py-2.5 text-sm text-tmaind hover:bg-red-800 focus:outline-none dark:border-red-700 dark:text-white dark:hover:bg-red-800 dark:focus:ring-gray-700"
									on:click={() => {
										handleDeleteButton(
											row.original.identifier,
											row.original.parentIdentifier,
											pageResourceKind
										);
									}}
								>
									<TrashBinSolid class="h-3 border-none outline-none" />
								</button>
							{:else}
								<div class="flex h-8 items-center px-6">--</div>
							{/if}
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		{/key}
	{/if}
</Table>

{#if paginationIsVisible}
	<PaginationComponent
		bind:pageIndexFromParent
		bind:pageLimitFromParent
		{resourceLength}
		{currentPage}
		{options}
		{limit}
		{table}
	></PaginationComponent>
{/if}

<style>
	/* Dropdown element Styling */
	:global(.dark .svelte-select-list div) {
		color: #ffffff;
		background-color: #374151 !important; /* gray-700 */
	}
	:global(.dark .svelte-select-list div:hover) {
		color: #ffffff;
		background-color: #1f2937 !important; /* gray-800 */
	}

	/* Multi Item Styling */
	:global(.dark .multi-item) {
		background-color: #374151 !important; /* gray-700 */
		outline: none !important;
		color: #ffffff;
	}
</style>
