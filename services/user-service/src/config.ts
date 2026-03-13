import { requireEnv, requireNumberEnv } from '@mgm/shared';

export const config = {
  port: requireNumberEnv('PORT'),
  mongoUri: requireEnv('MONGO_URI'),
  logLevel: requireEnv('LOG_LEVEL')
};
