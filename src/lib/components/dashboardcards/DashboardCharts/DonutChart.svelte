<script lang="ts">
	import { Chart } from 'flowbite-svelte';
	import type ApexCharts from 'apexcharts';

	export let data: number[];
	const dataCount = data.reduce((summ, val) => summ + val, 0);
	const options: ApexCharts.ApexOptions = {
		series: data,
		labels: ['Policy', 'User', 'Group', 'Variable', 'Host', 'Layer', 'Webservice'],
		colors: ['#0e9f6e', '#ff771f', '#475EE9', '#9061f9', '#bd4040', '#A3B763', '#87C4FF'],
		chart: {
			height: '300px',
			type: 'donut',
			foreColor: '#6b7280'
		},
		tooltip: {
			enabled: false
		},
		plotOptions: {
			pie: {
				donut: {
					labels: {
						show: true,
						value: {
							formatter: function (val) {
								return Math.floor((parseInt(val) / dataCount) * 100) + '%';
							}
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: true,
			formatter: function (val, opts) {
				// opts is a value with all the data in it plus the series index
				return opts.w.config.series[opts.seriesIndex];
			}
		}
	};
</script>

<Chart {options} />
