<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import type { BaseResource } from '$lib/api/baseResources';
	import WeeklyTimeChart from './DashboardCharts/WeeklyTimeChart.svelte';
	import MonthlyTimeChart from './DashboardCharts/MonthlyTimeChart.svelte';

	export let title: string;
	export let additionalClass: string = '';
	export let resources: BaseResource[];

	$: resourceDates = resources.map((resource) => resource.parsed_created_at);

	let weeklyButtonRef: HTMLButtonElement;

	let weeklyHidden: boolean = false;
	let monthlyHidden: boolean = true;

	function switchTimeChart() {
		weeklyHidden = !weeklyHidden;
		monthlyHidden = !monthlyHidden;
	}

	$: if (weeklyButtonRef) weeklyButtonRef.focus();
</script>

<Card class={`${additionalClass} mb-0 flex w-full flex-col justify-between pb-0`}>
	<div class="flex flex-row flex-wrap justify-between">
		<slot resource={resourceDates.length} />
		<div class="flex w-fit flex-wrap justify-center gap-x-2">
			<button
				bind:this={weeklyButtonRef}
				on:click={() => {
					switchTimeChart();
				}}
				class="text-normal w-32 items-center gap-x-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-tmainl hover:bg-gray-100 focus:outline-none dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
				disabled={!weeklyHidden}>Previous 7 day</button
			>

			<button
				on:click={() => {
					switchTimeChart();
				}}
				class="text-normal w-32 items-center gap-x-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-tmainl hover:bg-gray-100 focus:outline-none dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
				disabled={!monthlyHidden}>Previous 30 day</button
			>
		</div>
	</div>
	<div>
		<div hidden={weeklyHidden} class="m-0 w-full">
			<WeeklyTimeChart {title} {resourceDates} />
		</div>
		<div hidden={monthlyHidden} class="m-0 w-full">
			<MonthlyTimeChart {title} {resourceDates} />
		</div>
	</div>
</Card>
