import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Req,
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
  UpdateRoleDto,
} from '../../dto/user.dto';
import { RefreshTokenDto } from '../../dto/auth.dto';
import { Request } from 'express';

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
  async getProfile(@Req() req: Request): Promise<UserProfileDto> {
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
    @Req() req: Request,
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
  async updateName(
    @Req() req: Request,
    @Body() updateNameDto: UpdateNameDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateName(req.user.sub, updateNameDto);
  }

  @ApiOperation({ summary: "Update user's mobile number" })
  @ApiResponse({
    status: 200,
    description: 'Mobile number updated successfully',
  })
  @Put('mobile')
  async updateMobileNumber(
    @Req() req: Request, // Automatically gets user from token payload
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
    @Req() req: Request,
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
  @Post('logout')
  async logout(@Req() req: Request, @Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Access token is required');
    }

    return this.userService.logout(accessToken, refreshTokenDto.token);
  }

  @ApiOperation({ summary: 'Logout the user and invalidate tokens' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @Patch('role')
  async updateRole(@Req() req: Request, @Body() updateRoleDto: UpdateRoleDto) {
    console.log(req.user);
    return this.userService.updateRole(updateRoleDto);
  }
}
