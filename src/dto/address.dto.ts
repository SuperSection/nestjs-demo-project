import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddressDto {
  @ApiProperty({ default: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty({ default: 'Near Central Park' })
  @IsString()
  @IsNotEmpty()
  landmark: string;

  @ApiProperty({ default: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ default: 'New York' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ default: 'United States' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ default: '456 Elm Avenue' })
  @IsString()
  @IsOptional()
  addressLine?: string;

  @ApiPropertyOptional({ default: 'Opposite City Mall' })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiPropertyOptional({ default: 'Los Angeles' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ default: '90001' })
  @IsString()
  @IsOptional()
  pin?: string;

  @ApiPropertyOptional({ default: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ default: 'United States' })
  @IsString()
  @IsOptional()
  country?: string;
}
