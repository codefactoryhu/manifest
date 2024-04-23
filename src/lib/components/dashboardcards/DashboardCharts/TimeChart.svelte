<script lang="ts">
	import type ApexCharts from 'apexcharts';
	import { Chart } from 'flowbite-svelte';

	export let title: string;
	export let data: number[];
	export let xAxisLabels: string[] | number[];

	const options: ApexCharts.ApexOptions = {
		series: [
			{
				name: `${title} created`,
				data: data
			}
		],
		title: {
			text: `${title}`,
			align: 'center',
			margin: 10,
			offsetX: 0,
			offsetY: -10,
			floating: false,
			style: {
				fontSize: '20px',
				fontWeight: 'bold',
				fontFamily: undefined,
				color: '#1a56db'
			}
		},
		chart: {
			toolbar: {
				show: false
			},

			height: 200,
			type: 'bar',
			zoom: {
				enabled: false
			},
			foreColor: '#6b7280'
		},
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 6,
				borderRadiusApplication: 'around',

				columnWidth: '80%',
				barHeight: '100%',
				dataLabels: {
					total: {
						enabled: true,
						offsetX: 0,
						style: {
							fontSize: '13px',
							fontWeight: 900,
							color: '#1a56db'
						},
						formatter: function (val) {
							if (val === '0') {
								return val;
							}
							return '';
						}
					}
				}
			}
		},
		xaxis: {
			categories: xAxisLabels,

			position: 'bottom',
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			}
		},
		yaxis: {
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			labels: {
				show: false
			}
		}
	};
</script>

<Chart {options} />
