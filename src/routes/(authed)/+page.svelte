<script lang="ts">
	import { schemas } from '$lib/api/requests';
	import {
		// DashBoardResourceCard,
		OverallResourceCard,
		SmallTotalCard,
		UserRoleCard,
		UserSecretsCard
	} from '$lib';
	import { ClientHttpError } from '$lib/api/errors.js';
	import { Heading } from 'flowbite-svelte';
	// import { convertResources } from '$lib/api/requests/utils.js';
	// import PolicyResource from '$lib/api/policyResources.js';
	// import UserResource from '$lib/api/userResources.js';
	// import VariableResource from '$lib/api/variableResources.js';
	// import { FileCheckSolid } from 'flowbite-svelte-icons';

	export let data;

	let roleMemberships: schemas.RoleMembershipsResponse[] = data.roleMemberships;
	let secrets: Promise<Record<string, string>>;
	//let policies: PolicyResource[] = convertResources(data.policies, PolicyResource);
	//let users: UserResource[] = convertResources(data.users, UserResource);
	//let variables: VariableResource[] = convertResources(data.variables, VariableResource);

	if (data.secrets == null) {
		secrets = Promise.reject(new ClientHttpError(404, 'No Secrets'));
	} else {
		secrets = data.secrets;
	}

	const commonClass: string = 'max-w-none h-96 mb-0 pb-4 justify-center';
</script>

<div class="flex h-full flex-col overflow-y-auto">
	<Heading class="px-6 pt-4" tag="h1" customSize="text-3xl">Dashboard</Heading>

	<div class="2xl:grid-cols-7 grid grid-cols-4 gap-4 p-6 md:grid-cols-6 xl:grid-cols-8">
		<SmallTotalCard
			resourceKind={schemas.ResourceKind.Policy}
			resourceCount={data.policies.length}
		/>
		<SmallTotalCard resourceKind={schemas.ResourceKind.User} resourceCount={data.users.length} />
		<SmallTotalCard resourceKind={schemas.ResourceKind.Group} resourceCount={data.groups.length} />
		<SmallTotalCard
			resourceKind={schemas.ResourceKind.Variable}
			resourceCount={data.variables.length}
		/>
		<SmallTotalCard resourceKind={schemas.ResourceKind.Host} resourceCount={data.hosts.length} />
		<SmallTotalCard resourceKind={schemas.ResourceKind.Layer} resourceCount={data.layers.length} />
		<SmallTotalCard
			resourceKind={schemas.ResourceKind.Webservice}
			resourceCount={data.webservices.length}
		/>
	</div>

	<div
		class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"
	>
		<div class="col-span-1 md:col-span-2">
			<UserRoleCard additionalClass={`max-w-none h-96 mb-0 pb-4`} {roleMemberships} />
		</div>
		<div class="col-span-1 md:col-span-2">
			<UserSecretsCard additionalClass={`${commonClass}`} {secrets} />
		</div>
		<div class="col-span-1 md:col-span-4">
			<OverallResourceCard
				data={[
					data.policies.length,
					data.users.length,
					data.groups.length,
					data.variables.length,
					data.hosts.length,
					data.layers.length,
					data.webservices.length
				]}
				additionalClass={`max-w-none mb-0 pb-0 h-max md:h-96`}
			/>
		</div>

		<!-- <div class="col-span-1 md:col-span-4">
			<DashBoardResourceCard
				title={'Policies'}
				additionalClass={`${commonClass} min-w-min`}
				resources={policies}
				let:resource={numberOfResourceCreated}
			>
				<div class="flex flex-row gap-3">
					<FileCheckSolid
						class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
					/>
					Total Policies created:
					<p><b>{numberOfResourceCreated}</b></p>
				</div>
			</DashBoardResourceCard>
		</div>

		<div class="col-span-1 {commonClass} md:col-span-4">
			<DashBoardResourceCard
				title={'Users'}
				additionalClass={`${commonClass} min-w-min`}
				resources={users}
				let:resource={numberOfResourceCreated}
			>
				<div class="flex flex-row gap-3">
					<FileCheckSolid
						class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
					/>
					Total Users created:
					<p><b>{numberOfResourceCreated}</b></p>
				</div>
			</DashBoardResourceCard>
		</div>

		<div class="col-span-1 {commonClass} md:col-span-4">
			<DashBoardResourceCard
				title={'Variables'}
				additionalClass={`${commonClass} min-w-min`}
				resources={variables}
				let:resource={numberOfResourceCreated}
			>
				<div class="flex flex-row gap-3">
					<FileCheckSolid
						class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
					/>
					Total Variables created:
					<p><b>{numberOfResourceCreated}</b></p>
				</div>
			</DashBoardResourceCard>
		</div> -->
	</div>
</div>
