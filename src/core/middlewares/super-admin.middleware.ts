import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from 'src/api/user/user.service';
import { Role } from '../../enums/role.enum';

@Injectable()
export class SuperAdminMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const userId = req.user?.sub;
    console.log('user', req.user);
    if (!userId) {
      throw new ForbiddenException('Unauthorized access');
    }

    const user = await this.userService.findUserById(userId);
    if (!user || user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('You must be a SUPER_ADMIN to perform this action');
    }

    next();
  }
}
