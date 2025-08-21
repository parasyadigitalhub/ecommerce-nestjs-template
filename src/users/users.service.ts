import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Roles } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(createUserDto: CreateUserDto) {
    const {name, email, phone, status, profilePicture, password} = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('Email already in use');
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        status,
        profilePicture,
        password: hashedPassword,
        role: Roles.CUSTOMER, // enforce CUSTOMER
        CustomerProfile: {
          create: {}, // optional profile data
        },
      },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async createAdmin(createUserDto: CreateUserDto) {
    const {name, email, phone, status, profilePicture, password} = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('Email already in use');
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        status,
        profilePicture,
        password: hashedPassword,
        role: Roles.ADMIN, // enforce CUSTOMER
        AdminProfile: {
          create: {}, // optional profile data
        },
      },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async createDeliveryAgent(createUserDto: CreateUserDto) {
    const {name, email, phone, status, profilePicture, password} = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('Email already in use');
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        status,
        profilePicture,
        password: hashedPassword,
        role: Roles.DELIVERY, // enforce CUSTOMER
        DeliveryAgentProfile: {
          create: {}, // optional profile data
        },
      },
    });
    const { password: _, ...result } = user;
    return result;
  }

  //admin only
  async findAll(role?: string) {
  return this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      role: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true,
    },
    where: role ? { role: role as any } : {}, // filter by role if provided
    orderBy: { createdAt: 'desc' },
    });
  }

  //Customer only
  async CutomerProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        CustomerProfile: {
          select: {
            addresses: true,
            reviews: true,
            couponUsages: true,
            orders: true,
            cart: true
          }
        }
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  //Customer only
  async AdminProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        AdminProfile: {
          select: {
            notes: true
          }
        }
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  //Customer only
  async DeliveryProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        DeliveryAgentProfile: {
          select: {
            vehicleNumber: true,
            vehicleType: true,
            assignedArea: true,
            availability: true,
            rating: true,
            totalDeliveries: true,
            currentOrders: true
          }
        }
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  //admin only
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  //admin only
  // async update(id: string, updateUserDto: UpdateUserDto) {
  //   await this.findOne(id); // ensure user exists

  //   const updateData: any = { ...updateUserDto };

  //   if (updateUserDto.password) {
  //     updateData.password = await bcrypt.hash(updateUserDto.password, 10);
  //   }

  //   if (updateUserDto.role) {
  //     const role = await this.prisma.role.findUnique({
  //       where: { name: updateUserDto.role },
  //     });

  //     if (!role) {
  //       throw new ConflictException(
  //         `Invalid role. Available roles: 'admin', 'staff', 'customer'`,
  //       );
  //     }

  //     updateData.roleId = role.id;
  //     delete updateData.role;
  //   }

  //   const updatedUser = await this.prisma.user.update({
  //     where: { id },
  //     data: updateData,
  //     include: { role: true },
  //   });

  //   const { password: _, ...result } = updatedUser;
  //   return result;
  // }

  async remove(id: string) {
    await this.CutomerProfile(id); // ensure user exists

    await this.prisma.user.delete({ where: { id } });

    return { message: `User with ID ${id} deleted successfully` };
  }
}
