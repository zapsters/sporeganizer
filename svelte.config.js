import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ['src/styles']
		}
	}),
	kit: {
		adapter: adapter()
	}
};

export default config;
