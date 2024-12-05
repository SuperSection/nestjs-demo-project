import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtUtils } from '../../utils/jwt.utils';
import { PrismaService } from '../../database/prisma.service';
import { UserModule } from '../user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, JwtUtils, UserService, AuthService, JwtAuthGuard],
  exports: [JwtUtils],
})
export class AuthModule {}
