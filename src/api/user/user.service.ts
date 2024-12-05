import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PrismaService } from '../../database/prisma.service';
import { comparePasswords, hashPassword } from '../../utils/hash.util';
import {
  UserProfileDto,
  UpdatePasswordDto,
  UpdateNameDto,
  UpdateMobileNumberDto,
} from '../../dto/user.dto';
import { UpdateAddressDto } from '../../dto/address.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async updatePassword(userId: string, { currentPassword, newPassword }: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Verify current password
    const isPasswordValid = await comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid current password');

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { address: true },
    });
    if (!user) throw new BadRequestException('User not found');

    const addressExists = user.address.some((addr) => addr.id === addressId);
    if (!addressExists) throw new BadRequestException('Address not found');

    return this.prisma.address.update({
      where: { id: addressId },
      data: updateAddressDto,
      select: {
        addressLine: true,
        landmark: true,
        city: true,
        state: true,
        pin: true,
        country: true, // Include only the necessary address fields
      },
    });
  }

  async updateName(userId: string, { name }: UpdateNameDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        name: true,
        email: true,
      },
    });
  }

  async updateMobileNumber(userId: string, updateMobileNumberDto: UpdateMobileNumberDto) {
    // Check if the new mobile number is already taken
    const existingUser = await this.prisma.user.findFirst({
      where: {
        mobile: updateMobileNumberDto.mobile,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Mobile number is already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { mobile: updateMobileNumberDto.mobile },
      select: {
        email: true,
        mobile: true,
      },
    });
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    // Fetch user with addresses
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: {
          select: {
            id: true,
            addressLine: true,
            landmark: true,
            city: true,
            state: true,
            pin: true,
            country: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
    };
  }

  async logout(accessToken: string, refreshToken: string) {
    // Add both tokens to the cache (blacklist) with their TTL
    const accessTokenTTL = 15 * 60 * 1000;
    const refreshTokenTTL = 7 * 24 * 60 * 60 * 1000;

    await this.cacheManager.set(`blacklist:accessToken:${accessToken}`, true, accessTokenTTL);
    await this.cacheManager.set(`blacklist:refreshToken:${refreshToken}`, true, refreshTokenTTL);

    return { message: 'Logged out successfully' };
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }
}
