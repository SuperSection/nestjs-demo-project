import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { JwtUtils } from '../../utils/jwt.utils';
import { SuperAdminMiddleware } from '../../core/middlewares/super-admin.middleware';

@Module({
  imports: [JwtModule],
  controllers: [UserController],
  providers: [JwtUtils, JwtAuthGuard, UserService, PrismaService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SuperAdminMiddleware)
      .forRoutes({ path: 'user/role', method: RequestMethod.GET });
  }
}
