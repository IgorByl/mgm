import { requireCsvEnv, requireEnv, requireNumberEnv } from '@mgm/shared';

export const config = {
  port: requireNumberEnv('PORT'),
  mongoUri: requireEnv('MONGO_URI'),
  kafkaBrokers: requireCsvEnv('KAFKA_BROKERS'),
  kafkaTopic: requireEnv('KAFKA_TOPIC'),
  publishBatchSize: requireNumberEnv('PUBLISH_BATCH_SIZE'),
  pollIntervalMs: requireNumberEnv('POLL_INTERVAL_MS'),
  logLevel: requireEnv('LOG_LEVEL'),
  maxRetries: requireNumberEnv('MAX_RETRIES')
};
