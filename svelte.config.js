import sveltePreprocess from 'svelte-preprocess';

const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ['src/styles']
		}
	})
};

export default config;
