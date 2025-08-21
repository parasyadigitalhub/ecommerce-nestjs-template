import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { CouponService } from './coupouns.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // Add
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  // List
  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  // Get one
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  // Update (Patch)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  // Delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('applicable-coupouns')
  findApplicableCoupons(@Request() req) {
    const user_id = req.user.id
    return this.couponService.findApplicableCoupons(user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('apply-coupoun')
  applyCoupon(@Query('coupoun_id') coupoun_id: string, @Request() req) {
    const user_id = req.user.id
    return this.couponService.applyCoupon(user_id, coupoun_id);
  }
}
