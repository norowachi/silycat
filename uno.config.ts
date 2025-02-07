import { defineConfig, presetIcons, presetUno, presetWind } from 'unocss';
import PresetRemToPX from '@unocss/preset-rem-to-px';

export default defineConfig({
	theme: {
		colors: {
			/* Dark Theme / Default */
			blurple: '#5865f2',
			'main-darkest': '#1c1d23',
			'main-pre-darkest': '#191d2a',
			'main-darker': '#1e1f22',
			'main-dark': '#2b2d31',
			'main-dark-hover': '#36373c',
			main: '#313338',
			'main-light': '#35373c',
			'main-lighter': '#404249',
			'fake-white': '#f3fefc',

			primary: '#5c69eb',
			secondary: '#4f5058',
			danger: '#ba3438',
			success: '#508048',

			'primary-hover': '#4b55be',
			'secondary-hover': '#6e6f78',
			'danger-hover': '#892625',
			'success-hover': '#3d6336',
			'white-hover': '#84868b',

			'check-checked': '#23a55a',
			'check-unchecked': '#80848e',
		},
	},
	rules: [
		[/^(border|b)-(l|r|t|b|x|y)-(\d+)/, ([, _, side, n]) => setBorderFromLetter(side, Number(n))],
	],
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

function setBorderFromLetter(letter: string, number: number) {
	switch (letter) {
		case 'l':
			return { 'border-left': `${number}px solid` };
		case 'r':
			return { 'border-right': `${number}px solid` };
		case 't':
			return { 'border-top': `${number}px solid` };
		case 'b':
			return { 'border-bottom': `${number}px solid` };
		case 'x':
			return { 'border-left': `${number}px solid`, 'border-right': `${number}px solid` };
		case 'y':
			return { 'border-top': `${number}px solid`, 'border-bottom': `${number}px solid` };
		default:
			return { border: `${number}px solid` };
	}
}
