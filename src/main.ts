import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL ?? '',
    credentials: true,
  });

  app.use(helmet());

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Server is running on PORT ${process.env.PORT}`);
    }
  });
}
bootstrap();
