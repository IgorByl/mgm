import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DomainEventType } from '../types/events';

export type OutboxStatus = 'pending' | 'processed' | 'failed';

@Schema({ timestamps: false })
export class OutboxEvent {
  @Prop({ required: true })
  eventId!: string;

  @Prop({ required: true, enum: ['UserCreated', 'UserUpdated', 'UserDeleted'] })
  eventType!: DomainEventType;

  @Prop({ required: true })
  aggregateId!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ required: true, enum: ['pending', 'processed', 'failed'], default: 'pending' })
  status!: OutboxStatus;

  @Prop({ required: true, default: 0 })
  retryCount!: number;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;

  @Prop({ type: MongooseSchema.Types.Date })
  processedAt?: Date;
}

export type OutboxEventDocument = OutboxEvent & Document;

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEvent);
OutboxEventSchema.index({ status: 1, createdAt: 1 });
