import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-cloudflare';

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
