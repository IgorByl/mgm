import { requireCsvEnv, requireEnv, requireNumberEnv } from '@mgm/shared';

export const config = {
  port: requireNumberEnv('PORT'),
  kafkaBrokers: requireCsvEnv('KAFKA_BROKERS'),
  kafkaTopic: requireEnv('KAFKA_TOPIC'),
  kafkaGroupId: requireEnv('KAFKA_GROUP_ID'),
  logLevel: requireEnv('LOG_LEVEL')
};
