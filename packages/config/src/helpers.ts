/**
 * Retrieve the value of an environment variable.
 *
 * @returns The value of the environment variable, or `undefined` if it is not set.
 */
export function getEnvVar(name: string) {
  return process.env[name];
}

/**
 * Retrieve the value of the named environment variable, throwing if it is not set.
 *
 * @param name - The name of the environment variable to retrieve
 * @returns The value of the environment variable
 * @throws Error if the environment variable is not set (message: `Mandatory environment variable "<name> is not set"`)
 */
export function getEnvVarOrThrow(name: string): string {
  const value = getEnvVar(name);
  if (!value) {
    throw new Error(`Mandatory environment variable "${name} is not set"`);
  }
  return value;
}