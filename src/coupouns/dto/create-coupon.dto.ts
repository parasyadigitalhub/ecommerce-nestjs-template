import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator'
import { Type } from 'class-transformer'

enum CouponConditions {
  PURCHASE_COUPON = "purchase_coupoun",
  FIRST_USER = "first_user"
  // add other conditions as needed
}

export class CreateCouponDto {
  @IsString()
  coupon_code: string;

  @IsEnum(CouponConditions)
  @IsOptional()
  condition?: CouponConditions = CouponConditions.PURCHASE_COUPON;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimum_purchase_value?: number = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_amount?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  usage_limit_per_person?: number = 1;

  @IsOptional()
  @IsBoolean()
  is_valid?: boolean = true;
}
