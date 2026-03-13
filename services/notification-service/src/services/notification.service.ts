import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { STREAM_CONSUMER, type DomainEvent, type StreamConsumer } from '@mgm/shared';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(STREAM_CONSUMER)
    private readonly streamConsumer: StreamConsumer
  ) {
    this.logger.setContext(NotificationService.name);
  }

  async onModuleInit(): Promise<void> {
    await this.streamConsumer.start(async (event) => {
      await this.handleEvent(event);
    });
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    if (event.eventType === 'UserCreated') {
      this.logger.info(
        { event },
        `Welcome ${event.payload?.name ?? 'Unknown'}! Notification sent.`
      );
      return;
    }
    if (event.eventType === 'UserDeleted') {
      this.logger.info(
        { event },
        `User deleted: ${event.userId}. Notification sent.`
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.streamConsumer.stop();
  }
}
