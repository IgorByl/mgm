import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { STREAM_PRODUCER, type StreamProducer } from '@mgm/shared';
import { config } from '../config';
import { OutboxEvent, OutboxEventDocument } from '../schemas/outbox.schema';

@Injectable()
export class UserPublisherService implements OnModuleInit, OnModuleDestroy {
  private interval?: NodeJS.Timeout;
  private running = false;

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEventDocument>,
    @Inject(STREAM_PRODUCER)
    private readonly streamProducer: StreamProducer,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UserPublisherService.name);
  }

  async onModuleInit(): Promise<void> {
    this.interval = setInterval(() => {
      void this.pollAndPublish();
    }, config.pollIntervalMs);

    await this.pollAndPublish();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private async pollAndPublish(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const events = await this.outboxModel
        .find({
          $or: [
            { status: 'pending' },
            // !Note: Not all failed events are retried but we are the data producers here (controll the interface and load) and more likely the issues will be retriable
            { status: 'failed', retryCount: { $lt: config.maxRetries } }
          ]
        })
        .sort({ createdAt: 1 })
        .limit(config.publishBatchSize)
        .exec();

      if (events.length === 0) return;

      try {
        await this.streamProducer.publishBatch(
          events.map((event) => ({
            eventId: event.eventId,
            eventType: event.eventType,
            timestamp: event.createdAt.toISOString(),
            userId: event.aggregateId,
            payload: event.payload
          }))
        );

        const ids = events.map((e) => e._id);
        await this.outboxModel
          .updateMany(
            { _id: { $in: ids } },
            { $set: { status: 'processed', processedAt: new Date() } }
          )
          .exec();
      } catch (err) {
        this.logger.error({ err }, 'Failed to publish outbox event batch');

        const ids = events.map((e) => e._id);
        await this.outboxModel
          .updateMany(
            { _id: { $in: ids } },
            { $set: { status: 'failed' }, $inc: { retryCount: 1 } }
          )
          .exec();
      }
    } finally {
      this.running = false;
    }
  }
}
