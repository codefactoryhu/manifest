<script lang="ts">
	import { page } from '$app/stores';
	import NotFound from '$lib/pages/NotFound.svelte';
	import ServerError from '$lib/pages/ServerError.svelte';
	import Maintenance from '$lib/pages/Maintenance.svelte';

	type ErrorData = {
		title: string;
		description: string;
	};

	// These basic error paths are handled
	const errorComponents: Record<number, ErrorData> = {
		400: { title: 'Bad Request', description: 'Malformed request, client error' },
		401: { title: 'Unauthorized', description: 'Authentication failure' },
		403: { title: 'Forbidden', description: 'Authorization failure' },
		404: { title: 'Not Found', description: 'Requested resource not found' },
		405: { title: 'Method Not Allowed', description: 'Unsupported HTTP method' },
		408: { title: 'Request Timeout', description: 'Request took too long to process' },
		429: {
			title: 'Too Many Requests',
			description: 'Rate limiting, the client has sent too many requests in a given amount of time'
		},
		500: { title: 'Internal Server Error', description: 'Generic server error' },
		502: {
			title: 'Bad Gateway',
			description:
				'Server acting as a gateway or proxy received an invalid response from an upstream server'
		},
		503: { title: 'Service Unavailable', description: 'Server is not ready to handle the request' },
		504: {
			title: 'Gateway Timeout',
			description:
				'Server acting as a gateway or proxy did not receive a timely response from an upstream server!'
		}
	};
	let errorData: ErrorData = errorComponents[$page.status] || '';
</script>

<div>
	{#if $page.status && errorData.title}
		{#if $page.status === 503}
			<Maintenance
				statusCode={$page.status.toString()}
				title={errorData.title}
				description={errorData.description}
			/>
		{:else if $page.status === 404}
			<NotFound
				statusCode={$page.status.toString()}
				title={errorData.title}
				description={errorData.description}
			/>
		{:else if $page.status >= 400 && $page.status < 600}
			<ServerError
				statusCode={$page.status.toString()}
				title={errorData.title}
				description={errorData.description}
			></ServerError>
		{/if}
	{:else}
		<!-- It is possible to create a specific error page, which differs from the status codes mentioned earlier. -->
		<ServerError statusCode={$page.status.toString()} description={$page.error?.message}
		></ServerError>
	{/if}
</div>
