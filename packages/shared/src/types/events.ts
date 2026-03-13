export type DomainEventType = 'UserCreated' | 'UserUpdated' | 'UserDeleted';

export interface DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  eventId: string;
  eventType: DomainEventType;
  timestamp: string;
  userId: string;
  payload: TPayload;
}
