import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CheckOutService } from './checkout.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('stripe')
export class CheckOutController {
  constructor(private readonly checkoutService: CheckOutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  async createPaymentIntent(@Body() body: { amount: number; currency: string },
   @Query('productId') productId: string, 
   @Query('quantity') quantity: number, 
   @Query('cartId') cartId: string, 
   @Request() req) {
    const user = req.user.id
    return this.checkoutService.createPaymentIntent(user, productId, quantity, cartId);
  }

  @Post('refunds')
  async refundPayment(@Body() body: { paymentIntentId: string }) {
    return this.checkoutService.refundPayment(body.paymentIntentId);
  }

  @Post('payment-links')
  async createPaymentLink(@Body() body: { priceId: string }) {
    return this.checkoutService.createPaymentLink(body.priceId);
  }
}