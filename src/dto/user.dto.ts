import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { Role } from '../enums/role.enum';

export class UserProfileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  mobile: string;

  @ApiProperty({
    type: [AddressDto],
    description: 'List of user addresses. At least one primary address is required.',
  })
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto[];

  @ApiProperty()
  @IsEnum(Role)
  role: Role;
}

export class UpdatePasswordDto {
  @ApiProperty({ default: 'password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ default: 'newpassword' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  newPassword: string;
}

export class UpdateMobileNumberDto {
  @ApiProperty()
  @Matches(/^\+\d{1,3}-\d{7,12}$/, {
    message: 'Mobile number must be in the format +<country_code>-<number>',
  })
  @IsString()
  @IsNotEmpty()
  mobile: string;
}

export class UpdateNameDto {
  @ApiProperty({ default: 'demo name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateRoleDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(Role)
  role: Role;
}
