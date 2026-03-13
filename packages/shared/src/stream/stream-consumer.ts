import type { DomainEvent } from '../types/events';

export type DomainEventHandler = (event: DomainEvent) => Promise<void> | void;

export interface StreamConsumer {
  start(handler: DomainEventHandler): Promise<void>;
  stop(): Promise<void>;
  checkConnection(): Promise<void>;
}

export const STREAM_CONSUMER = Symbol('STREAM_CONSUMER');
