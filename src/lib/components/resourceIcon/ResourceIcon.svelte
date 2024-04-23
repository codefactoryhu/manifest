<script lang="ts">
	import type { ResourceKind } from '$lib/api/requests/schemas';
	import {
		DesktopPcSolid,
		FileCheckSolid,
		GlobeSolid,
		LayersSolid,
		UserGroupSolid,
		UserSolid,
		FileShieldSolid
	} from 'flowbite-svelte-icons';

	export let resourceKind: ResourceKind;
	export let color: boolean = false;
	export { className as class };
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined = 'md';
	export let role: string | undefined = undefined;
	export let background: boolean = false;

	let className = '';

	function getColorClass(kind: ResourceKind): string {
		const classMap: { [key in ResourceKind]: string } = {
			policy: '!text-policy whitespace-normal break-all',
			user: '!text-user whitespace-normal break-all',
			group: '!text-group whitespace-normal break-all',
			variable: '!text-variable whitespace-normal break-all',
			host: '!text-host whitespace-normal break-all',
			layer: '!text-layer whitespace-normal break-all',
			webservice: '!text-webservice whitespace-normal break-all'
		};

		const colorClass = classMap[kind];

		if (color) {
			return colorClass;
		} else {
			return '';
		}
	}

	function getBackGroundClass(kind: ResourceKind): string {
		const classMap: { [key in ResourceKind]: string } = {
			policy: '!bg-policy',
			user: '!bg-user',
			group: '!bg-group',
			variable: '!bg-variable',
			host: '!bg-host',
			layer: '!bg-layer',
			webservice: '!bg-webservice'
		};

		const backgroundClass = classMap[kind];

		if (background) {
			return backgroundClass;
		} else {
			return '';
		}
	}

	function getFullClass(colorClass: string, className: string, backgroundClass: string): string {
		const defaultClass =
			'focus:outline-none' +
			(colorClass !== '' ? ' ' + colorClass : '') +
			(backgroundClass !== '' ? ' ' + backgroundClass : '');
		if (className !== '') {
			return defaultClass + ' ' + className;
		} else {
			return defaultClass;
		}
	}

	const colorClass = getColorClass(resourceKind);
	const backgroundClass = getBackGroundClass(resourceKind);
	const fullClass = getFullClass(colorClass, className, backgroundClass);
</script>

<slot name="before-text" {colorClass} />

{#if resourceKind === 'policy'}
	<FileCheckSolid class={fullClass} {size} {role} ariaLabel="Policy Icon" />
{:else if resourceKind === 'user'}
	<UserSolid class={fullClass} {size} {role} ariaLabel="User Icon" />
{:else if resourceKind === 'group'}
	<UserGroupSolid class={fullClass} {size} {role} ariaLabel="Group Icon" />
{:else if resourceKind === 'variable'}
	<FileShieldSolid class={fullClass} {size} {role} ariaLabel="Variable Icon" />
{:else if resourceKind === 'host'}
	<DesktopPcSolid class={fullClass} {size} {role} ariaLabel="Host Icon" />
{:else if resourceKind === 'layer'}
	<LayersSolid class={fullClass} {size} {role} ariaLabel="Layer Icon" />
{:else if resourceKind === 'webservice'}
	<GlobeSolid class={fullClass} {size} {role} ariaLabel="Webservice Icon" />
{/if}

<slot name="after-text" {colorClass} />
