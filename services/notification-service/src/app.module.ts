import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { StreamModule } from '@mgm/shared';
import { config } from './config';
import { HealthController } from './controllers/health.controller';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.logLevel
      }
    }),
    StreamModule.forRoot({
      consumer: {
        clientId: 'notification-service',
        brokers: config.kafkaBrokers,
        topic: config.kafkaTopic,
        groupId: config.kafkaGroupId
      }
    })
  ],
  controllers: [HealthController],
  providers: [NotificationService]
})
export class AppModule {}
