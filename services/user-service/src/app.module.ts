import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "nestjs-pino";
import { config } from "./config";
import { HealthController } from "./controllers/health.controller";
import { UsersModule } from "./users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.logLevel,
      },
    }),
    MongooseModule.forRoot(config.mongoUri, { serverSelectionTimeoutMS: 5000 }),
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
