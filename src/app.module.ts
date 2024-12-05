import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';

import { DatabaseModule } from './database/database.module';
import { UserService } from './api/user/user.service';
import { UserModule } from './api/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './api/auth/auth.controller';
import { AuthModule } from './api/auth/auth.module';
import { AuthService } from './api/auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().port().default(8000),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // Default TTL for items in the cache (e.g., 1 hour)
      max: 100,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    AuthService,
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  controllers: [AuthController],
})
export class AppModule {}
