import { Module } from '@nestjs/common';
import { CouponService } from './coupouns.service';
import { CouponController } from './coupouns.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, PrismaService],
})
export class CouponModule {}
