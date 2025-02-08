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
	presets: [presetUno(), presetWind(), presetIcons({ scale: 1.2 }), PresetRemToPX()],
});

// function setBorderFromLetter(letter: string, number: number) {
// 	switch (letter) {
// 		case 'l':
// 			return { 'border-left': `${number}px solid` };
// 		case 'r':
// 			return { 'border-right': `${number}px solid` };
// 		case 't':
// 			return { 'border-top': `${number}px solid` };
// 		case 'b':
// 			return { 'border-bottom': `${number}px solid` };
// 		case 'x':
// 			return { 'border-left': `${number}px solid`, 'border-right': `${number}px solid` };
// 		case 'y':
// 			return { 'border-top': `${number}px solid`, 'border-bottom': `${number}px solid` };
// 		default:
// 			return { border: `${number}px solid` };
// 	}
// }
