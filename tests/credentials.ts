import * as path from 'path';

/** Where the setup project persists the authenticated session. Keep this path out of git. */
export const AUTH_FILE = path.join('.auth', 'user.json');

export interface Credentials {
  username: string;
  password: string;
}

/**
 * Credentials for the demo app. Half-configured env is a mistake we want to
 * surface loudly, so no silent `|| ''` fallbacks: either set both vars or none.
 */
export function demoCredentials(): Credentials {
  const { ADMIN_USER, ADMIN_PASSWORD } = process.env;

  if ((ADMIN_USER === undefined) !== (ADMIN_PASSWORD === undefined)) {
    throw new Error('Set both ADMIN_USER and ADMIN_PASSWORD, or neither to use the demo defaults.');
  }

  // Keep in sync with demo-app/server.mjs
  return { username: ADMIN_USER ?? 'demo_admin', password: ADMIN_PASSWORD ?? 'demo_password' };
}
