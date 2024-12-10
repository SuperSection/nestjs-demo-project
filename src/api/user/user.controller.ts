import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { UpdateAddressDto } from '../../dto/address.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import {
  UserProfileDto,
  UpdatePasswordDto,
  UpdateNameDto,
  UpdateMobileNumberDto,
} from '../../dto/user.dto';
import { RefreshTokenDto } from '../../dto/auth.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: "Get user's profile" })
  @ApiResponse({
    status: 200,
    description: 'User profile details',
  })
  @Get('profile')
  async getProfile(@Request() req): Promise<UserProfileDto> {
    return this.userService.getUserProfile(req.user.sub);
  }

  @ApiOperation({
    summary: "Update user's password",
    description: "Update user's password by providing current password and new password",
  })
  @ApiResponse({
    status: 204,
    description: 'Password updated successfully',
  })
  @HttpCode(204)
  @Put('password')
  async updatePassword(
    @Request() req, // Automatically gets user from token payload
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    await this.userService.updatePassword(req.user.sub, updatePasswordDto);
  }

  @ApiOperation({ summary: "Update user's name" })
  @ApiResponse({
    status: 200,
    description: 'Name updated successfully',
  })
  @Put('name')
  async updateName(@Request() req, @Body() updateNameDto: UpdateNameDto): Promise<UserProfileDto> {
    return this.userService.updateName(req.user.sub, updateNameDto);
  }

  @ApiOperation({ summary: "Update user's mobile number" })
  @ApiResponse({
    status: 200,
    description: 'Mobile number updated successfully',
  })
  @Put('mobile')
  async updateMobileNumber(
    @Request() req, // Automatically gets user from token payload
    @Body() updateMobileNumberDto: UpdateMobileNumberDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateMobileNumber(req.user.sub, updateMobileNumberDto);
  }

  @ApiOperation({
    summary: "Update user's address",
    description: "Update user's address with specific addressId in as a path parameter",
  })
  @ApiResponse({
    status: 200,
    description: 'Name updated successfully',
  })
  @ApiParam({
    name: 'addressId',
    description: 'Unique identifier of the address',
    example: '615060a1c03f05ed287a3a10',
  })
  @Put('address/:addressId')
  async updateAddress(
    @Request() req,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateAddress(req.user.sub, addressId, updateAddressDto);
  }

  @ApiOperation({ summary: 'Logout the user and invalidate tokens' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: Request, @Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Access token is required');
    }

    return this.userService.logout(accessToken, refreshTokenDto.token);
  }
}
