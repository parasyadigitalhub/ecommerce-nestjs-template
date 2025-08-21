import { Module } from '@nestjs/common';
import { BrandService } from './brands.service';
import { BrandController } from './brands.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BrandController],
  providers: [BrandService, PrismaService],
})
export class BrandModule {}
