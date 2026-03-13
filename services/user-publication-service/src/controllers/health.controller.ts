import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection
  ) {}

  @Get()
  async getHealth(): Promise<{ status: string; service: string; db: string }> {
    if (!this.connection.db) {
      throw new ServiceUnavailableException('db not connected');
    }

    try {
      await this.connection.db.admin().ping();
    } catch {
      throw new ServiceUnavailableException('db ping failed');
    }

    return { status: 'ok', service: 'user-publication-service', db: 'ok' };
  }
}
