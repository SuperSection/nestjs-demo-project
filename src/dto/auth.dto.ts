import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { AddressDto } from './address.dto';

export class CreateUserDto {
  @ApiProperty({ default: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: '+91-1234567890' })
  @IsString()
  @Matches(/^\+\d{1,3}-\d{7,12}$/, {
    message: 'Mobile number must be in the format +<country_code>-<number>',
  })
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ default: 'password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: [AddressDto],
    description: 'List of user addresses. At least one primary address is required.',
  })
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  @ArrayMinSize(1, { message: 'A primary address is required.' })
  address: AddressDto[];
}

export class AuthenticateUserDto {
  @ApiProperty({ default: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: 'password' })
  @IsNotEmpty()
  password: string;
}

export class TokensDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
