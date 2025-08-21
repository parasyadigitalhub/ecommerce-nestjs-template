import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsString()
  orderNumber: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  shippingAddressId?: string;

  @IsOptional()
  @IsUUID()
  billingAddressId?: string;

  // ✅ Nested items
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
