const daisyui = require('daisyui');

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [
		require('@tailwindcss/typography'),
		daisyui,
		require('tailwind-scrollbar')({ nocompatible: true })
	],

	daisyui: {
		themes: ['corporate', 'business'],
		darkTheme: 'business'
	}
};

module.exports = config;
