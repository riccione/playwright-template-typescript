/**
 * Environment access helpers.
 *
 * Two failure modes dominate real-world test runs, and both are silent:
 * a missing variable surfaces as an obscure error deep inside a test, and
 * an empty value is happily used as a credential. These helpers fail fast
 * with an actionable message instead.
 */

/** Trimmed value of an env var, or undefined when it is unset or blank. */
export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** Trimmed value of a required env var. Throws with copy-pasteable guidance. */
export function requireEnv(name: string): string {
  const value = optionalEnv(name);

  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill it in ` +
        `(CI: expose it as a repository secret named ${name}).`
    );
  }

  return value;
}
