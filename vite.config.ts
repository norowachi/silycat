import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from '@unocss/svelte-scoped/vite';

export default defineConfig({
	plugins: [
		UnoCSS({
			classPrefix: '',
			injectReset: '@unocss/reset/tailwind.css',
		}),
		sveltekit(),
	],
	optimizeDeps: {
		exclude: ['socket.io-client'],
	},
});
