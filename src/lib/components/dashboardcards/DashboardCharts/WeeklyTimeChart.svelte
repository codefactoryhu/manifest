<script lang="ts">
	import { getDaysInMonth } from '$lib/api/requests/utils';
	import TimeChart from './TimeChart.svelte';

	export let title: string;
	export let resourceDates: Date[];
	const today = new Date();

	let xAxisLabels: string[] = new Array(7).fill('');
	let numberOfResourcesByDate: number[] = new Array(7).fill(0);
	let datesOfLastWeek: number[] = createDatesOfLastWeek();
	$: calculatePercentageOfResourcesSortedByDate();

	function createDatesOfLastWeek() {
		let datesOfLastWeek: number[] = new Array(7);

		for (let indexOfDates = 0; indexOfDates < 7; indexOfDates++) {
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

			datesOfLastWeek[6 - indexOfDates] = date;
			const labelDate = new Date(year, month, date);
			xAxisLabels[6 - indexOfDates] = `${labelDate.toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short'
			})}`;
		}

		return datesOfLastWeek;
	}

	function calculatePercentageOfResourcesSortedByDate() {
		const datesOfResourcesFromLastWeek = getDatesFromLastWeek(resourceDates);

		datesOfResourcesFromLastWeek.forEach((date) => {
			let indexOfDate = datesOfLastWeek.indexOf(date.getDate());

			if (indexOfDate >= 0 || indexOfDate <= 6) {
				numberOfResourcesByDate[indexOfDate]++;
			} else {
				console.error('Date not found. You are not suppos to see this');
			}
		});
	}

	function getDatesFromLastWeek(allDates: Date[]) {
		const currentDate = today.getDate();
		let currentMonth = today.getMonth();

		if (currentDate - 6 < 1) {
			currentMonth = today.getMonth() - 1;
			if (currentMonth < 0) {
				currentMonth = 11;
			}
		}

		const lastWeekStart = new Date(today.getFullYear(), currentMonth, today.getDate() - 6);

		const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

		return allDates.filter((date) => date > lastWeekStart && date < nextDay);
	}
</script>

<TimeChart {title} data={numberOfResourcesByDate} {xAxisLabels} />
