import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from '@unocss/svelte-scoped/vite';
import { transformerDirectives } from 'unocss';

export default defineConfig({
	plugins: [
		UnoCSS({
			cssFileTransformers: [transformerDirectives()],
			classPrefix: '',
			injectReset: '',
		}),
		sveltekit(),
	],
});
