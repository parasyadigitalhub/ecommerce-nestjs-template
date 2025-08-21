// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Roles, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus = UserStatus.active;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsString()
  @MinLength(6)
  password: string;
}
