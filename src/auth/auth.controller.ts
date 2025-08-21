// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request, ForbiddenException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { EmailDto } from './dto/email.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  //need to make it only accessbile by admin
  @Post('register-admin')
  async registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.registeradmin(registerDto);
  }

  @Post('register-delivery')
  async registerDeliveryAgent(@Body() registerDto: RegisterDto) {
    return this.authService.registerdeliveryagent(registerDto);
  }

  // @Get('profile')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("ADMIN")
  // getProfile(@Request() req) {
  //   return req.user;
  // }

  @Post('otp/generate')
  async generateOtp(@Body() emailDto: EmailDto) {
    return this.authService.generateOtp(emailDto.email);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() otpVerifyDto: OtpVerifyDto) {
    return this.authService.validateOtp(otpVerifyDto.email, otpVerifyDto.otp);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("ADMIN")
  async getAdminProfile(@Request() req) {
    const userId = req.user.id
    const role = req.user.role
    console.log(role)
    return this.authService.getAdminProfile(userId, role);
  }

  // 🔹 Customer profile
  @Get('customer/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER", "ADMIN")
  async getCustomerProfile(@Request() req) {
    const userId = req.user.id
    const role = req.user.role
    return this.authService.getCustomerProfile(userId, role);
  }

  // 🔹 Delivery profile
  @Get('delivery/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELIVERY", "ADMIN")
  async getDeliveryProfile(@Request() req) {
    const userId = req.user.id
    const role = req.user.role
    return this.authService.getDeliveryProfile(userId, role);
  }
}
