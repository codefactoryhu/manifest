<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import DonutChart from './DashboardCharts/DonutChart.svelte';

	export let data: number[];
	export let additionalClass: string = '';

	function isDataLengthSumIsNotZero(data: number[]): boolean {
		const sum = data.reduce((acc, curr) => acc + curr, 0);
		return sum !== 0;
	}
</script>

{#if isDataLengthSumIsNotZero(data)}
	<Card class={`${additionalClass} pb-5`}>
		<h4 class="px-2 text-xl font-bold text-tmainl dark:text-tmaind">Overall resources</h4>
		<div class="flex h-full flex-col justify-around">
			<DonutChart data={data.map((data) => data)} />
		</div>
	</Card>
{/if}
