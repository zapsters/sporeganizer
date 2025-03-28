import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-cloudflare';

const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ['src/styles']
		}
	}),
	kit: {
		adapter: adapter()
		// ... truncated ...
	}
};

export default config;
