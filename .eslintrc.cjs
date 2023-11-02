module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'airbnb-base',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			},
		},
	],
	rules: {
		'import/prefer-default-export': ['off'],
		quotes: ['error', 'single'],
	},
	'import/parsers': {
		'svelte-eslint-parser': ['.svelte'],
		'espree': ['.js']
	},
	'settings': {
		'import/resolver': {
			'eslint-import-resolver-custom-alias': {
				'alias': {
					'$lib': 'src/lib',
					'$app': 'node_modules/@sveltejs/kit/src/runtime/app',
					'@sveltejs/kit': 'node_modules/@sveltejs/kit/src/exports/index.js'
				},
				'extensions': [
					'.js'
				]
			}
		}
	}
};
