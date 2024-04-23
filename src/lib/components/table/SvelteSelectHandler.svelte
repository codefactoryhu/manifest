<script lang="ts">
	import type { BaseResource } from '$lib/api/baseResources';
	import type { Column, Table } from '@tanstack/svelte-table';
	import { createEventDispatcher } from 'svelte';
	import SvelteSelect from 'svelte-select';
	import type { Readable } from 'svelte/motion';

	export let column: Column<BaseResource, unknown>;
	export let table: Readable<Table<BaseResource>>;

	type nameType = {
		nameVisible: BaseResource;
		nameOriginal: string;
		total: number;
	};

	type filterRow = {
		value: string;
		label: string;
	};

	type resourceType = {
		filterRows: filterRow[];
		count: number;
	};

	type keyValueType = {
		key: string;
		value: string;
	};

	const dispatch = createEventDispatcher();

	let resources = getResourcesBasedOnColumnId(column.id);
	let selectedValuesSet = new Set();

	function formattedDate(date: string): string {
		const userTimeZoneOffset = new Intl.DateTimeFormat().resolvedOptions().timeZone;
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			timeZone: userTimeZoneOffset
		};
		return new Date(date).toLocaleDateString('en-GB', options);
	}

	function getResourcesBasedOnColumnId(columnId?: string): resourceType {
		// Handle the case where columnId is undefined
		if (!columnId) return { filterRows: [], count: 0 };
		const column = $table.getColumn(columnId);
		if (!column) return { filterRows: [], count: 0 };

		const uniqueValues = column.getFacetedUniqueValues();

		// Handle the case where originalName, displayedName and UniqueValues Total Number needed:
		const results: nameType[] = Array.from(uniqueValues, ([name, value]) => {
			const isDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}$/.test(name);
			const isNumber = !isNaN(Number(name));
			return {
				nameVisible: isDateFormat
					? formattedDate(name)
					: isNumber
						? Number(name)
						: name?.split(':').at(-1) ?? 'N/A',
				nameOriginal: name,
				total: value
			};
		});

		const sortedUniqueValues = results.sort((a, b) => {
			return b.total - a.total;
		});

		const slicedResults = sortedUniqueValues.slice(0, sortedUniqueValues.length);

		const selectData: resourceType = {
			filterRows: slicedResults.map(({ nameVisible, nameOriginal, total }) => ({
				value: nameOriginal,
				label: `${nameVisible} .. (${total})`
			})),
			count: slicedResults.length
		};

		return selectData;
	}

	function formatData(input: keyValueType): Array<string> {
		if (Array.isArray(input)) {
			// Handle the case where input is an array
			const formattedArray: Array<string> = input.map((item) => item.value);
			return formattedArray;
		} else if (typeof input === 'object' && input !== null) {
			// Handle the case where input is a single object
			let value: Array<string> = Array.isArray(input.value) ? input.value : [input.value];
			return value;
		} else {
			// Handle other cases or throw an error if needed
			throw new Error('Invalid input format');
		}
	}

	function handleSvelteSelectChange(selectedValues: keyValueType) {
		let list = formatData(selectedValues);
		list.forEach((element) => {
			selectedValuesSet.add(element);
		});

		column.setFilterValue(Array.from(selectedValuesSet));

		// if selector is activated, the current page jump to page 0.
		if ($table.getState().pagination.pageIndex >= $table.getPageCount()) {
			dispatch('setCurrentPage');
		}
	}

	function handleSvelteSelectClear(selectedValues: keyValueType) {
		let value = formatData(selectedValues);

		if (value !== undefined) {
			value.forEach((element) => {
				selectedValuesSet.delete(element);
			});
		}
		column.setFilterValue(Array.from(selectedValuesSet));
	}
</script>

<SvelteSelect
	multiFullItemClearable={true}
	closeListOnChange={false}
	clearable={true}
	multiple={true}
	placeholderAlwaysShow={true}
	inputStyles="dark:!text-tmaind"
	class="!font-light dark:!border-0 dark:!bg-bgd dark:!font-normal dark:!text-tmaind"
	placeholder={`${column.id} ... (${resources.count})`}
	items={resources.filterRows}
	on:change={(e) => handleSvelteSelectChange(e.detail)}
	on:clear={(e) => handleSvelteSelectClear(e.detail)}
></SvelteSelect>
