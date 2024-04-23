<script lang="ts">
	import { Card, DescriptionList, Heading, List } from 'flowbite-svelte';
	import {
		UserCircleSolid,
		AdressBookSolid,
		DesktopPcSolid,
		MapPinSolid,
		LockTimeSolid
	} from 'flowbite-svelte-icons';
	import ErrorCardContent from '$lib/components/error/ErrorCardContent.svelte';

	export let data;
</script>

<div class="h-full w-full overflow-y-auto px-8">
	<main class="max-w-screen-2xl mx-auto h-full w-full">
		<Heading class="py-4" tag="h1" customSize="text-2xl">User Info</Heading>
		<Card padding="sm" size="lg" class="max-w-screen-2xl w-full">
			{#if data.success}
				<List
					tag="dl"
					class="divide-y divide-dvL300 text-tmainl dark:divide-dvD700 dark:text-tmaind"
				>
					<div class="flex flex-col pb-3">
						<DescriptionList tag="dt" class="mb-1">
							<UserCircleSolid
								class="mb-0.5 mr-1 inline-block h-4 w-5 text-tsecl outline-none dark:text-tsecd"
							/>
							User Name
						</DescriptionList>
						<DescriptionList tag="dd">{data.result?.username}</DescriptionList>
					</div>
					<div class="flex flex-col pb-3">
						<DescriptionList tag="dt" class="mb-1">
							<AdressBookSolid
								class="mb-0.5 mr-1 inline-block h-4 w-5 text-tsecl outline-none dark:text-tsecd"
							/>
							Account</DescriptionList
						>
						<DescriptionList tag="dd">{data.result?.account}</DescriptionList>
					</div>
					<div class="flex flex-col pb-3">
						<DescriptionList tag="dt" class="mb-1">
							<MapPinSolid
								class="mb-0.5 mr-1 inline-block h-4 w-5 text-tsecl outline-none dark:text-tsecd"
							/>
							IP Address</DescriptionList
						>
						<DescriptionList tag="dd">{data.result?.client_ip}</DescriptionList>
					</div>
					<div class="flex flex-col pb-3">
						<DescriptionList tag="dt" class="mb-1">
							<LockTimeSolid
								class="mb-0.5 mr-1 inline-block h-4 w-5 text-tsecl outline-none dark:text-tsecd"
							/>
							Token Issued At</DescriptionList
						>
						<DescriptionList tag="dd">{data.result?.token_issued_at}</DescriptionList>
					</div>
					<div class="flex flex-col pb-3">
						<DescriptionList tag="dt" class="mb-1">
							<DesktopPcSolid
								class="mb-0.5 mr-1 inline-block h-4 w-5 text-tsecl outline-none dark:text-tsecd"
							/>
							User Agent</DescriptionList
						>
						<DescriptionList tag="dd">{data.result?.user_agent}</DescriptionList>
					</div>
				</List>
			{:else}
				<ErrorCardContent message={data.error} />
			{/if}
		</Card>
	</main>
</div>
