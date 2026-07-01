import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('\n==================================================================');
  console.log('[GLOBAL SETUP] Booting test execution session...');
  console.log(`[GLOBAL SETUP] Base URL target configured as: ${config.projects[0].use.baseURL}`);
  console.log('==================================================================\n');
  
  // Place global hooks here (e.g., seeding a database, initializing Docker, or global auth API pins)
}

export default globalSetup;
