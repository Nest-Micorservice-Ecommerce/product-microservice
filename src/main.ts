import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Bootstrap');

  console.log(envs.natsSrevers);


  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        // host: envs.host,
        // port: envs.port,
        // NATS solo pide los servers
        servers: envs.natsSrevers,
      },
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    // forbidNonWhitelisted: true,
    })
    );

  await app.listen();



  logger.log(`Products Microservice running on port ${envs.port}`);
}
bootstrap();
