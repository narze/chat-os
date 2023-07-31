import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'export NODE_ENV=test; pnpm run build && pnpm run preview',
		port: 4173
	},
	testDir: 'tests'
};

export default config;
