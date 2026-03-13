import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { KafkaProducerService } from './kafka-producer.service';
import { STREAM_CONSUMER } from './stream-consumer';
import { STREAM_PRODUCER } from './stream-producer';
import {
  KAFKA_CONSUMER_CONFIG,
  KAFKA_PRODUCER_CONFIG,
  type StreamConfig
} from './stream.config';

@Module({})
export class StreamModule {
  static forRoot(config: StreamConfig): DynamicModule {
    const providers: Provider[] = [];
    const exports: symbol[] = [];

    if (config.producer) {
      providers.push(
        { provide: KAFKA_PRODUCER_CONFIG, useValue: config.producer },
        KafkaProducerService,
        { provide: STREAM_PRODUCER, useExisting: KafkaProducerService }
      );
      exports.push(STREAM_PRODUCER);
    }

    if (config.consumer) {
      providers.push(
        { provide: KAFKA_CONSUMER_CONFIG, useValue: config.consumer },
        KafkaConsumerService,
        { provide: STREAM_CONSUMER, useExisting: KafkaConsumerService }
      );
      exports.push(STREAM_CONSUMER);
    }

    return { module: StreamModule, providers, exports };
  }
}
