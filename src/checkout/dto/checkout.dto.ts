import { IsOptional, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';

export enum SupportedCurrency {
  USD = 'usd',
  INR = 'inr',
  EUR = 'eur',
}

export class CreatePaymentIntentDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  cartId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;
}
