import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { images, variants, initialStock, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        images: images
          ? {
              create: images,
            }
          : undefined,
        variants: variants
          ? {
              create: variants,
            }
          : undefined,
        inventory: initialStock
          ? {
              create: {
                quantity: initialStock,
                reserved: 0,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
      },
    });
  }

  async findAll(page = 1, limit = 10, categoryId?: string, featured?: boolean) {
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(featured !== undefined && { isFeatured: featured }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          images: true,
          inventory: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
      },
    });

    return product;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(productId: string, quantity: number) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { productId },
    });

    if (!inventory) {
      return this.prisma.inventory.create({
        data: {
          productId,
          quantity,
          reserved: 0,
        },
      });
    }

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity },
    });
  }

  async reserveStock(productId: string, quantity: number) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { productId },
    });

    if (!inventory || inventory.quantity - inventory.reserved < quantity) {
      throw new Error('Insufficient stock');
    }

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: inventory.reserved + quantity,
      },
    });
  }

  async releaseStock(productId: string, quantity: number) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { productId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: Math.max(0, inventory.reserved - quantity),
      },
    });
  }
}
