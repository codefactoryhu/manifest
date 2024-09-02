<script lang="ts">
	import {
		DarkMode,
		Dropdown,
		DropdownDivider,
		DropdownItem,
		NavBrand,
		NavUl,
		Navbar
	} from 'flowbite-svelte';
	import { ResourceKind } from '$lib/api/requests/schemas';
	import { Drawer, Sidebar, SidebarWrapper, SidebarGroup, SidebarItem } from 'flowbite-svelte';
	import {
		ArrowLeftToBracketOutline,
		BarsSolid,
		ChartPieSolid,
		ChervonDoubleLeftSolid,
		ChervonDoubleRightSolid,
		ChevronDownSolid,
		CloseSolid,
		UserCircleSolid
	} from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import { writable, type Writable } from 'svelte/store';
	import { onMount, setContext } from 'svelte';
	import ConjurLogo from '$lib/assets/ConjurLogo.svelte';
	import { ResourceIcon, Timer } from '$lib';
	import { goto } from '$app/navigation';
	import { capitalizeFirstChar, handleYamlTheme } from '$lib/api/requests/utils.js';

	export let data: {
		countdown: number;
		account: string;
		userid: string;
		userIsAdmin: boolean;
	};

	let countdown: number = data.countdown;

	let drawerHidden: Writable<boolean> = writable(false);
	setContext('drawerHidden', drawerHidden);

	let activateClickOutside: boolean = true;
	let sidebarIsSlim: boolean = false;
	let breakPointForHamburgerBar: number = 975;
	let resetPointForSlimBar: number = 640;
	let transitionParams: {
		x: number;
		duration: number;
		easing: (t: number) => number;
	} = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
	let width: number;

	const toggleDrawer: () => void = () => {
		$drawerHidden = !$drawerHidden;
	};
	const toggleSidebarIsSlim: () => void = () => {
		sidebarIsSlim = !sidebarIsSlim;
	};

	onMount(() => {
		if (width >= breakPointForHamburgerBar) {
			$drawerHidden = false;
			activateClickOutside = false;
		} else {
			$drawerHidden = true;
			activateClickOutside = true;
		}
	});

	$: if (width >= breakPointForHamburgerBar) {
		$drawerHidden = false;
		activateClickOutside = false;
	} else {
		$drawerHidden = true;
		activateClickOutside = true;
	}

	$: if (width <= resetPointForSlimBar) {
		sidebarIsSlim = false;
	}

	function handleClick() {
		if (activateClickOutside) {
			$drawerHidden = !$drawerHidden;
		}
	}

	// Define sidebar items
	const sidebarItems = [
		{ label: 'Policies', href: '/policies', resourceKind: ResourceKind.Policy },
		{ label: 'Users', href: '/users', resourceKind: ResourceKind.User },
		{ label: 'Groups', href: '/groups', resourceKind: ResourceKind.Group },
		{ label: 'Variables', href: '/variables', resourceKind: ResourceKind.Variable },
		{ label: 'Hosts', href: '/hosts', resourceKind: ResourceKind.Host },
		{ label: 'Layers', href: '/layers', resourceKind: ResourceKind.Layer },
		{ label: 'Webservices', href: '/webservices', resourceKind: ResourceKind.Webservice }
	];
</script>

<svelte:window bind:innerWidth={width} />

<Navbar
	let:hidden
	class="fixed left-0 top-0 z-60 !h-16 items-center divide-dvL300 border-b-brl300 bg-bgls px-4 py-3 dark:divide-dvD500 dark:border-b-brl500 dark:bg-bgds"
	border={true}
	fluid={true}
>
	{#if $drawerHidden}
		<BarsSolid
			on:click={toggleDrawer}
			class="h-8 w-8 rounded-sm p-2 hover:bg-hlbg focus:outline-none dark:hover:bg-hdbg lg:hidden"
		/>
	{:else}
		<CloseSolid
			on:click={toggleDrawer}
			class="h-8 w-8 rounded-sm p-2 hover:bg-hlbg focus:outline-none dark:hover:bg-hdbg lg:hidden"
		/>
	{/if}
	<NavBrand href="/" class="mr-auto py-1">
		<div class="ml-4 h-8 w-8">
			<ConjurLogo />
		</div>

		<span
			class="hidden self-center whitespace-nowrap pl-4 text-xl font-semibold dark:text-white sm:flex"
		>
			Manifest
		</span>
	</NavBrand>

	<Dropdown
		placement="bottom-end"
		triggeredBy="#avatar-menu"
		data-collapse-toggle="mobile-menu-3"
		containerClass="py-1"
	>
		<DropdownItem href="/user-info">
			<span class="flex flex-row items-center gap-x-2 text-nowrap">
				<UserCircleSolid class="outline-none"></UserCircleSolid>User Info
			</span>
		</DropdownItem>

		<DropdownDivider />
		<DropdownItem>
			<span class="flex flex-row items-center gap-x-2 text-nowrap">
				<ArrowLeftToBracketOutline class="outline-none"></ArrowLeftToBracketOutline>
				<button on:click={() => goto('/logout')}>Sign out</button>
			</span>
		</DropdownItem>
	</Dropdown>
	<NavUl
		{hidden}
		divClass="lg:order-none lg:block lg:w-auto"
		ulClass="flex flex-col gap-4 text-sm font-medium lg:flex-row lg:border-0 lg:bg-transparent dark:lg:bg-transparent"
	></NavUl>

	<div class="hidden px-2 text-tsecl dark:text-tsecd sm:flex">
		Account: {capitalizeFirstChar(data.account)}
	</div>
	<div class="flex items-center gap-1 sm:gap-2">
		<div class="sm:hidden">
			<button on:click={handleYamlTheme}>
				<DarkMode
					size="sm"
					btnClass="rounded-lg px-2 py-2 text-tsecl hover:bg-hlbg hover:text-tmainl dark:hover:text-tmaind focus:outline-none dark:text-tsec dark:hover:bg-hdbg dark:focus:ring-ringl"
				/>
			</button>
		</div>
		<div class="hidden sm:flex">
			<button on:click={handleYamlTheme}>
				<DarkMode
					btnClass="rounded-lg px-2 py-2 text-tsecl hover:bg-hlbg hover:text-tmainl dark:hover:text-tmaind focus:outline-none dark:text-tsec dark:hover:bg-hdbg dark:focus:ring-ringl"
				/>
			</button>
		</div>
		<div
			class="item hidden h-9 items-center gap-x-1 rounded-md bg-gray-50 px-2 dark:bg-bgdf dark:text-white sm:flex"
		>
			Timelock: <Timer {countdown} />
		</div>
		<div
			class="item flex h-9 items-center gap-x-1 rounded-md bg-gray-50 px-2 dark:bg-bgdf dark:text-white sm:hidden"
		>
			<Timer {countdown} />
		</div>
		<button
			id="avatar-menu"
			class="flex h-9 flex-row items-center justify-end gap-x-2 rounded-lg border-gray-100 bg-gray-50 px-4 text-tmainl hover:bg-gray-100 focus:outline-none dark:border-gray-100 dark:bg-bgdf dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
		>
			{capitalizeFirstChar(data.userid)}
			<ChevronDownSolid class="h-3 w-3 outline-none focus:outline-none dark:text-white" />
		</button>
	</div>
</Navbar>
<Drawer
	transitionType="fly"
	backdrop={activateClickOutside}
	{transitionParams}
	bind:hidden={$drawerHidden}
	activateClickOutside={false}
	width="w-full {sidebarIsSlim ? 'sm:w-20' : 'sm:w-56'}"
	class="z-50 mt-16 divide-dvL300 border-r border-brl300 bg-bgls pl-5 dark:border-brl500 dark:bg-bgds"
	id="sidebar"
	position="fixed"
>
	<Sidebar asideClass="{sidebarIsSlim ? 'w-10' : 'w-44'} ">
		<SidebarWrapper divClass="overflow-y-auto rounded">
			<SidebarGroup>
				<!-- Dashboard -->
				<SidebarItem
					on:click={() => handleClick()}
					label={sidebarIsSlim ? '' : 'Dashboard'}
					href="/"
				>
					<svelte:fragment slot="icon">
						<ChartPieSolid
							class="h-6 w-6 text-tsecl outline-none transition duration-75 dark:text-tsecd"
						/>
					</svelte:fragment>
				</SidebarItem>
				<!-- Resources  -->
				{#each sidebarItems as item}
					<SidebarItem
						on:click={() => handleClick()}
						label={sidebarIsSlim ? '' : item.label}
						href={item.href}
					>
						<svelte:fragment slot="icon">
							<ResourceIcon
								resourceKind={item.resourceKind}
								class="h-6 w-6 text-tsecl outline-none transition duration-75 dark:text-tsecd"
							/>
						</svelte:fragment>
					</SidebarItem>
				{/each}
			</SidebarGroup>
		</SidebarWrapper>

		<div class="absolute bottom-5 hidden pl-4 sm:flex">
			<button on:click={toggleSidebarIsSlim}>
				{#if sidebarIsSlim}
					<ChervonDoubleRightSolid size="xs" class="text-tsecl outline-none dark:text-tsecd" />
				{:else}
					<ChervonDoubleLeftSolid size="xs" class="text-tsecl outline-none dark:text-tsecd" />
				{/if}
			</button>
		</div>
	</Sidebar>
</Drawer>

<div class="relative {$drawerHidden ? 'ml-0' : sidebarIsSlim ? 'ml-20' : 'ml-56'} h-full">
	<slot />
</div>
