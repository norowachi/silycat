import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from '@unocss/svelte-scoped/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		UnoCSS({
			classPrefix: '',
			injectReset: '@unocss/reset/tailwind.css',
		}),
		sveltekit(),
	],
	optimizeDeps: {
		exclude: ['showdown'],
	},
});
