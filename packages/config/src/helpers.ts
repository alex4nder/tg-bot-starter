export function getEnvVar(name: string) {
  return process.env[name];
}

export function getEnvVarOrThrow(name: string): string {
  const value = getEnvVar(name);
  if (!value) {
    throw new Error(`Mandatory environment variable "${name} is not set"`);
  }
  return value;
}
