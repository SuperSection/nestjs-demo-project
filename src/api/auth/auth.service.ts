import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';

import { JwtUtils } from '../../utils/jwt.utils';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../database/prisma.service';
import { comparePasswords, hashPassword } from '../../utils/hash.util';
import { CreateUserDto, AuthenticateUserDto, TokensDto, RefreshTokenDto } from '../../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private readonly prisma: PrismaService,
    private jwtUtils: JwtUtils,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { address, password, ...userData } = createUserDto;

    // Check if user already exists by email or mobile
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { mobile: userData.mobile }],
      },
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new BadRequestException('User with this email already exists');
      }
      if (existingUser.mobile === userData.mobile) {
        throw new BadRequestException('User with this mobile number already exists');
      }
    }

    const hashedPassword = await hashPassword(password);

    await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        address: { create: address },
      },
    });

    return { status: true, message: 'User registarted successfully' };
  }

  async validateUser(authDto: AuthenticateUserDto): Promise<TokensDto> {
    const user = await this.usersService.findUserByEmail(authDto.email);

    if (!user || !(await comparePasswords(authDto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.jwtUtils.generateTokens(user.id, user.email);
    return tokens;
  }

  async refreshTokens(RefreshTokenDto: RefreshTokenDto) {
    // Validate the refresh token
    const payload: JwtPayload = await this.jwtUtils.verifyRefreshToken(RefreshTokenDto.token);

    // Fetch the user from the database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtUtils.generateAccessToken(accessPayload);
    return { token: accessToken };
  }
}
