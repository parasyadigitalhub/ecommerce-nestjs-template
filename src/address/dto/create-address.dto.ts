import { IsString, IsBoolean, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateAddressDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string; // 'shipping' | 'billing'

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
