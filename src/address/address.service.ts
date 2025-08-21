import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(createAddressDto: CreateAddressDto) {
    return this.prisma.address.create({
      data: createAddressDto,
    });
  }

  async findAll() {
    return this.prisma.address.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });
    if (!address) throw new NotFoundException(`Address with id ${id} not found`);
    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensure exists
    return this.prisma.address.delete({
      where: { id },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
