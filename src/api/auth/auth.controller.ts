import { Body, Controller, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto, AuthenticateUserDto, TokensDto, RefreshTokenDto } from '../../dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register user with all required deatils and at least one address' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Login a user with email and password' })
  @ApiResponse({
    status: 202,
    description: 'User logged in successfully',
  })
  @Post('login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Body() loginDto: AuthenticateUserDto): Promise<TokensDto> {
    return await this.authService.validateUser(loginDto);
  }

  @ApiOperation({ summary: 'Refresh the access token with refresh token if valid' })
  @ApiResponse({
    status: 200,
    description: 'Refreshed the tokens',
  })
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshTokens(refreshTokenDto);
  }
}
