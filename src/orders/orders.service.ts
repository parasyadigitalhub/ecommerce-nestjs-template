import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-orders.dto';
import { UpdateOrderDto } from './dto/update-orders.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    return this.prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        payments: true,
        shippingAddress: true,
        billingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { items, ...orderData } = updateOrderDto;

    await this.findOne(id); // ensure exists

    return this.prisma.order.update({
      where: { id },
      data: {
        ...orderData,
        ...(items
          ? {
              items: {
                deleteMany: {}, // clear old items
                create: items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.total,
                })),
              },
            }
          : {}),
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensure exists
    return this.prisma.order.delete({
      where: { id },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
        shippingAddress: true,
        billingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async assignDeliveryAgent(orderId: string, deliveryAgentId: string) {
  // 1. Check if order exists
  const order = await this.prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundException(`Order with id ${orderId} not found`);

  // 2. Check if user exists and is a delivery agent
  const agent = await this.prisma.user.findUnique({ where: { id: deliveryAgentId } });
  if (!agent || agent.role !== 'DELIVERY') {
    throw new BadRequestException(`User with id ${deliveryAgentId} is not a delivery agent`);
  }

  // 3. Assign delivery agent & update status
  return this.prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryAgentProfileId: deliveryAgentId,  // make sure your Order model has this field
      status: 'shipped', // or 'processing', depending on your workflow
    },
    include: {
      DeliveryAgentProfile: true, // optional relation include
    },
  });
}


}
