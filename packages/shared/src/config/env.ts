export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function requireNumberEnv(name: string): number {
  const raw = requireEnv(name);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return parsed;
}

export function requireCsvEnv(name: string): string[] {
  const raw = requireEnv(name);

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}
