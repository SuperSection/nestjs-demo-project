import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/database/prisma.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { JwtUtils } from 'src/utils/jwt.utils';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [UserController],
  providers: [JwtUtils, JwtAuthGuard, UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
