import { Injectable, NotFoundException ,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as XLSX from 'xlsx';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';


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

  // ✅ Bulk upload using Excel
  async bulkCreateFromExcel(filePath: string) {
    // 1. Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    // 2. Convert each row → DTO
    const dtos: CreateProductDto[] = rows.map((row) => ({
      name: row['Name'],
      description: row['Description'],
      price: Number(row['Price']),
      comparePrice: row['ComparePrice'] ? Number(row['ComparePrice']) : undefined,
      sku: row['SKU'],
      barcode: row['Barcode'],
      weight: row['Weight'] ? Number(row['Weight']) : undefined,
      dimensions: row['Dimensions'],
      isActive: row['IsActive'] ? Boolean(row['IsActive']) : true,
      isFeatured: row['IsFeatured'] ? Boolean(row['IsFeatured']) : false,
      categoryId: row['CategoryId'], // must be UUID
      brandId: row['BrandId'],  
      initialStock: row['InitialStock'] ? Number(row['InitialStock']) : 0,
      images: row['Images']
        ? row['Images'].split(',').map((url: string, idx: number) => ({
            url: url.trim(),
            isMain: idx === 0,
            sortOrder: idx,
          }))
        : [],
      variants: row['Variants']
        ? row['Variants'].split(',').map((v: string, idx: number) => {
            const [name, value] = v.split(':'); // e.g., "Color:Red"
            return {
              name: name?.trim() || `Option${idx + 1}`,
              value: value?.trim() || '',
            };
          })
        : [],
    }));

    // 3. Validate each DTO
    const validatedDtos = dtos.map((dto, idx) => {
      const instance = plainToInstance(CreateProductDto, dto);
      const errors = validateSync(instance);
      if (errors.length > 0) {
        throw new BadRequestException(
          `Row ${idx + 2} in Excel has validation errors: ${JSON.stringify(errors)}`,
        );
      }
      return instance;
    });

    // 4. Save products in a transaction
    return this.prisma.$transaction(async (tx) => {
    const createdProducts = [];
    for (const dto of validatedDtos) {
      const { images, variants, initialStock, categoryId, brandId, ...productData } = dto;
      const product = await tx.product.create({
        data: {
          ...productData,
          category: {
            connect: { id: categoryId },
          },
          brand: {
            connect: { id: brandId },
          },
          images: images?.length ? { create: images } : undefined,
          variants: variants?.length ? { create: variants } : undefined,
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
          brand:true
        },
      });
      createdProducts.push(product);
    }
    return createdProducts;
  });
  }


}
