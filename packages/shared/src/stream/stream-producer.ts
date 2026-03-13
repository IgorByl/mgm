import type { DomainEvent } from '../types/events';

export interface StreamProducer {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}

export const STREAM_PRODUCER = Symbol('STREAM_PRODUCER');
