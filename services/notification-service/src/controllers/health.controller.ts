import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { STREAM_CONSUMER, type StreamConsumer } from '@mgm/shared';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(STREAM_CONSUMER)
    private readonly streamConsumer: StreamConsumer
  ) {}

  @Get()
  async getHealth(): Promise<{
    status: string;
    service: string;
    kafka: string;
  }> {
    try {
      await this.streamConsumer.checkConnection();
    } catch {
      throw new ServiceUnavailableException('kafka not connected');
    }

    return { status: 'ok', service: 'notification-service', kafka: 'ok' };
  }
}
