import { IsUUID, IsInt, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  total: number;
}
