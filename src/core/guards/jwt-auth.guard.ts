import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
  Inject,
} from '@nestjs/common';

import { JwtUtils } from '../../utils/jwt.utils';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtils: JwtUtils,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract Authorization header
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('No token provided');
    }

    // Check if token is blacklisted
    const isBlacklisted = await this.cacheManager.get(`blacklist:accessToken:${accessToken}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been blacklisted');
    }

    try {
      // Validate Access Token
      const decodedAccessToken = await this.jwtUtils.verifyAccessToken(accessToken);
      request.user = decodedAccessToken; // Attach decoded user data
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
