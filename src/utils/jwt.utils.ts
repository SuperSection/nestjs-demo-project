import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtUtils {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Generate Access Token
  generateAccessToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY', '15m'),
    });
  }

  // Generate Refresh Token
  generateRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY', '7d'),
    });
  }

  // Generate both Access Token and Refresh Token
  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  // Verify Access Token
  async verifyAccessToken(token: string) {
    return await this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  // Verify Refresh Token
  async verifyRefreshToken(token: string) {
    return await this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  // Refrehs Access & Refresh Token
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      if (await this.isBlacklisted(refreshToken)) {
        throw new UnauthorizedException('Refresh Token is blacklisted');
      }

      // If valid, generate new tokens
      return this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid Refresh Token', error);
    }
  }

  async isBlacklisted(refreshToken: string): Promise<boolean> {
    return !!(await this.cacheManager.get(`blacklist:${refreshToken}`));
  }
}
