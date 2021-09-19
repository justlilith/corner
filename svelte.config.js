import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify'
import copy from 'rollup-plugin-copy'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	
	kit: {
		adapter: adapter(),
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		// ssr:false
		// vite: {
		// 	plugins: [
		// 		copy({
		// 			targets: [
		// 				{ src: 'src/routes/journal/posts', dest: 'functions/src'}
		// 			],
		// 			flatten:false
		// 		})
		// 	]
		// }
	}
};

export default config;
