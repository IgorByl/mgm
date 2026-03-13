import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { StreamModule } from '@mgm/shared';
import { config } from './config';
import { HealthController } from './controllers/health.controller';
import { OutboxEvent, OutboxEventSchema } from './schemas/outbox.schema';
import { UserPublisherService } from './services/user-publisher.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.logLevel
      }
    }),
    MongooseModule.forRoot(config.mongoUri, { serverSelectionTimeoutMS: 5000 }),
    MongooseModule.forFeature([
      { name: OutboxEvent.name, schema: OutboxEventSchema }
    ]),
    StreamModule.forRoot({
      producer: {
        clientId: 'user-publication-service',
        brokers: config.kafkaBrokers,
        topic: config.kafkaTopic
      }
    })
  ],
  controllers: [HealthController],
  providers: [UserPublisherService]
})
export class AppModule {}
