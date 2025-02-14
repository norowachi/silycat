import { defineConfig, presetIcons, presetUno, presetWind } from 'unocss';
import PresetRemToPX from '@unocss/preset-rem-to-px';

export default defineConfig({
	content: {
		pipeline: {
			include: [
				// the default
				/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
				// include js/ts files
				'src/**/*.{js,ts}',
			],
		},
	},
	presets: [PresetRemToPX(), presetUno(), presetWind(), presetIcons({ scale: 1.2 })],
});
