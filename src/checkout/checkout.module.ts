import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CheckOutController } from './checkout.controller';
import { CheckOutService } from './checkout.service';



@Module({})
export class CheckOutModule {
  static forRootAsync(): DynamicModule {
    return {
      module: CheckOutModule,
      controllers: [CheckOutController],
      imports: [ConfigModule.forRoot()],
      providers: [
        CheckOutService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService) =>
            configService.get('STRIPE_API_KEY'),
          inject: [ConfigService],
        },
      ],
    };
  }
}
