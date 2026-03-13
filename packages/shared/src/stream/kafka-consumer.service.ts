import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { PinoLogger } from 'nestjs-pino';
import type { DomainEvent } from '../types/events';
import type { DomainEventHandler, StreamConsumer } from './stream-consumer';
import { KAFKA_CONSUMER_CONFIG, type KafkaConsumerConfig } from './stream.config';

@Injectable()
export class KafkaConsumerService implements StreamConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: ReturnType<Kafka['consumer']>;

  constructor(
    @Inject(KAFKA_CONSUMER_CONFIG)
    private readonly config: KafkaConsumerConfig,
    private readonly logger: PinoLogger
  ) {
    this.kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers
    });

    this.consumer = this.kafka.consumer({
      groupId: this.config.groupId
    });

    this.logger.setContext(KafkaConsumerService.name);
  }

  async start(handler: DomainEventHandler): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.config.topic,
      fromBeginning: false
    });

    await this.consumer.run({
      eachBatchAutoResolve: false,
      eachBatch: async ({
        batch,
        resolveOffset,
        commitOffsetsIfNecessary,
        heartbeat,
        isRunning,
        isStale
      }) => {
        if (!isRunning() || isStale()) {
          return;
        }

        const messages = batch.messages.slice(0, 100);
        for (const message of messages) {
          if (!isRunning() || isStale()) {
            break;
          }

          const value = message.value?.toString();
          if (value) {
            await this.handleRawEvent(value, handler);
          }

          resolveOffset(message.offset);
          await heartbeat();
        }

        await commitOffsetsIfNecessary();
      }
    });

    this.logger.info('Kafka consumer started');
  }

  async checkConnection(): Promise<void> {
    await this.consumer.describeGroup();
  }

  private async handleRawEvent(
    raw: string,
    handler: DomainEventHandler
  ): Promise<void> {
    try {
      const event = JSON.parse(raw) as DomainEvent;
      await handler(event);
    } catch (err) {
      this.logger.error({ err }, 'Failed to parse Kafka event');
    }
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}
