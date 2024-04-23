<script lang="ts">
	import { onDestroy } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { linear as easing } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { displayAlert } from '../alert/AlertStore';

	export let countdown: number;

	let now = Date.now();
	let end = now + countdown * 1000;

	$: count = Math.round((end - now) / 1000);
	$: h = Math.floor(count / 3600);
	$: m = Math.floor((count - h * 3600) / 60);
	$: s = count - h * 3600 - m * 60;
	$: isLast15Seconds = count <= 15;

	function updateTimer() {
		now = Date.now();
	}

	let interval = setInterval(updateTimer, 1000);
	$: if (count <= 0) {
		clearInterval(interval);
		goto('/logout');
	}

	$: if (count == 30) {
		displayAlert(
			'yellow',
			'Attention!: The session will expire in 30 seconds. Please complete any remaining actions to ensure uninterrupted service!',
			10
		);
	}

	const duration = 1000;

	let offset = tweened(1, { duration, easing });
	let rotation = tweened(360, { duration, easing });

	$: offset.set(Math.max(count - 1, 0) / countdown);
	$: rotation.set((Math.max(count - 1, 0) / countdown) * 360);

	function padValue(value: number, length = 2, char = '0') {
		const { length: currentLength } = value.toString();
		if (currentLength >= length) return value.toString();
		return `${char.repeat(length - currentLength)}${value}`;
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="timer {isLast15Seconds ? 'text-red-500' : ''}">
	<div class="timer">
		<span class="minutes">{padValue(m)}</span>:<span class="seconds">{padValue(s)}</span>
	</div>
</div>
