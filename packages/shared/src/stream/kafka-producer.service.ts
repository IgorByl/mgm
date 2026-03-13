import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { PinoLogger } from 'nestjs-pino';
import type { DomainEvent } from '../types/events';
import type { StreamProducer } from './stream-producer';
import { KAFKA_PRODUCER_CONFIG, type KafkaProducerConfig } from './stream.config';

@Injectable()
export class KafkaProducerService implements StreamProducer, OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(
    @Inject(KAFKA_PRODUCER_CONFIG)
    private readonly config: KafkaProducerConfig,
    private readonly logger: PinoLogger
  ) {
    this.kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers
    });

    this.producer = this.kafka.producer({
      idempotent: true,
      maxInFlightRequests: 1
    });

    this.logger.setContext(KafkaProducerService.name);
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.logger.info('Kafka producer connected');
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: this.config.topic,
      acks: -1,
      messages: [
        {
          key: event.userId,
          value: JSON.stringify(event)
        }
      ]
    });
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    await this.producer.sendBatch({
      topicMessages: [
        {
          topic: this.config.topic,
          messages: events.map((event) => ({
            key: event.userId,
            value: JSON.stringify(event)
          }))
        }
      ],
      acks: -1
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }
}
