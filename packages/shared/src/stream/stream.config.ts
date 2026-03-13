export interface KafkaProducerConfig {
  clientId: string;
  brokers: string[];
  topic: string;
}

export interface KafkaConsumerConfig {
  clientId: string;
  brokers: string[];
  topic: string;
  groupId: string;
}

export interface StreamConfig {
  producer?: KafkaProducerConfig;
  consumer?: KafkaConsumerConfig;
}

export const KAFKA_PRODUCER_CONFIG = Symbol('KAFKA_PRODUCER_CONFIG');
export const KAFKA_CONSUMER_CONFIG = Symbol('KAFKA_CONSUMER_CONFIG');
