<script lang="ts">
	import { getDaysInMonth } from '$lib/api/requests/utils';
	import TimeChart from './TimeChart.svelte';

	export let title: string;
	export let resourceDates: Date[];
	const today = new Date();

	let xAxisLabels: string[] = new Array(30).fill('');
	let numberOfResourcesByDate: number[] = new Array(30).fill(0);
	let datesOfLastMonth: number[] = createDatesOfLastMonth();

	$: calculatePercentageOfResourcesSortedByDate();

	function createDatesOfLastMonth() {
		let datesOfLastMonth: number[] = new Array(30);

		for (let indexOfDates = 0; indexOfDates < 30; indexOfDates++) {
			let date = today.getDate() - indexOfDates;
			let month = today.getMonth();
			let year = today.getFullYear();

			if (date < 1) {
				let daysOfCurrentMonth: number;

				if (month - 1 < 0) {
					month = 11;
					year--;
					daysOfCurrentMonth = getDaysInMonth(year, month);
					date = daysOfCurrentMonth - indexOfDates + 1;
				} else {
					month--;
					daysOfCurrentMonth = getDaysInMonth(year, month);
					date = daysOfCurrentMonth - indexOfDates + 1;
				}
			}

			datesOfLastMonth[29 - indexOfDates] = date;
			const labelDate = new Date(year, month, date);
			xAxisLabels[29 - indexOfDates] = `${labelDate.toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short'
			})}`;
		}

		return datesOfLastMonth;
	}

	function calculatePercentageOfResourcesSortedByDate() {
		const datesOfResourcesFromLastMonth = getDatesFromLastMonth(resourceDates);

		datesOfResourcesFromLastMonth.forEach((date) => {
			let indexOfDate = datesOfLastMonth.indexOf(date.getDate());

			if (indexOfDate >= 0 || indexOfDate <= 30) {
				numberOfResourcesByDate[indexOfDate]++;
			} else {
				console.error('Date not found. You are not suppos to see this');
			}
		});
	}

	function getDatesFromLastMonth(allDates: Date[]) {
		const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);

		const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

		return allDates.filter((date) => date > lastWeekStart && date < nextDay);
	}
</script>

<TimeChart {title} data={numberOfResourcesByDate} {xAxisLabels} />
