import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./src/tests/helpers/result-matchers.ts'],
		exclude: ['**\/dist/**']
	},
});
