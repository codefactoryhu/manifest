import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import 'dotenv/config';

const requiredEnvVariables = [
	{ name: 'CSRF_VALUE', message: 'CSRF_VALUE' },
	{ name: 'CONJUR_API_URL', message: 'CONJUR_API_URL' },
	{
		name: 'COOKIE_HTTP_SECURE',
		message: 'COOKIE_HTTP_SECURE'
	}
];

const missingEnvVariables = [];

requiredEnvVariables.forEach((envVar) => {
	if (process.env[envVar.name] === undefined) {
		missingEnvVariables.push(envVar.message);
	}
});

if (missingEnvVariables.length > 0) {
	const errorMessage = `Missing environment variables:\n${missingEnvVariables.join('\n')}`;
	console.log(errorMessage);
}

const csrfValue = process.env.CSRF_VALUE === 'false' ? false : true;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csrf: { checkOrigin: csrfValue }
	}
};

export default config;
