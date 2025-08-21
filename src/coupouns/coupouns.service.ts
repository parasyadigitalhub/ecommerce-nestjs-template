import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  // Add coupon
  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: dto,
    });
  }

    async findAll() {
    return this.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }, // newest coupons first
        where: {
        is_valid: true,                // only active coupons
        },
    });
    }
    
    async findApplicableCoupons(userId: string) {
      //check if the user is new
      const newUser = await this.prisma.order.count({
        where: {userId}
      }) === 0;

      // 1. Get all active coupons
      const coupons = await this.prisma.coupon.findMany({
        where: { is_valid: true },
      });

      // 2. For each coupon, check how many times the user has used it
      const applicableCoupons = [];
      for (const coupon of coupons) {
        if (coupon.condition === "first_user" && !newUser) {
          continue
        }

        const usageCount = await this.prisma.couponUsage.count({
        where: {
            userId,
            couponId: coupon.id,
        },
        });

        // 3. Only include if usage < allowed limit
        if (usageCount < coupon.usage_limit_per_person) {
        applicableCoupons.push({
            ...coupon,
            remaining_uses: coupon.usage_limit_per_person - usageCount,
        });
        }
      }
      return applicableCoupons;
    }


  // Get single coupon
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  // Update coupon (PATCH)
  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.coupon.update({
      where: { id },
      data: dto,
    });
  }

  // Delete coupon
  async remove(id: string) {
    await this.findOne(id); // ensure exists
    return this.prisma.coupon.delete({
      where: { id },
    });
  }


  async applyCoupon(userId: string, coupon_id: string, orderAmount?: number) {
    // 1. Find the coupon
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: coupon_id },
    });

    if (!coupon || !coupon.is_valid) {
      throw new Error('Invalid or inactive coupon');
    }

    // 2. Count how many times this user has used the coupon
    const usageCount = await this.prisma.couponUsage.count({
      where: { userId, couponId: coupon.id },
    });

    if (usageCount >= coupon.usage_limit_per_person) {
      throw new Error('You have reached the maximum usage limit for this coupon');
    }

    // 3. Handle coupon conditions
    if (coupon.condition === 'first_user') {
      // Check if user has made any purchase/order before
      const previousOrders = await this.prisma.order.count({
        where: { userId },
      });

      if (previousOrders > 0) {
        throw new Error('This coupon is only valid for first-time users');
      }
    } 
    else if (coupon.condition === 'purchase_coupoun') {
      // Ensure minimum purchase value is satisfied
      if (!orderAmount || orderAmount < Number(coupon.minimum_purchase_value)) {
        throw new Error(
          `This coupon requires a minimum purchase of ${coupon.minimum_purchase_value}`
        );
      }
    }

    // 4. Record usage
    await this.prisma.couponUsage.create({
      data: { userId, couponId: coupon.id },
    });

    return {
      message: 'Coupon applied successfully',
      discount: coupon.discount_amount,
      status: HttpStatus.OK,
    };
  }


}
