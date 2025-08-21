// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   // Create roles
//   const adminRole = await prisma.role.upsert({
//     where: { name: 'admin' },
//     update: {},
//     create: { name: 'admin' },
//   });

//   const staffRole = await prisma.role.upsert({
//     where: { name: 'staff' },
//     update: {},
//     create: { name: 'staff' },
//   });

//   const customerRole = await prisma.role.upsert({
//     where: { name: 'customer' },
//     update: {},
//     create: { name: 'customer' },
//   });

//   // Create admin user
//   const hashedPassword = await bcrypt.hash('password@123', 10);
//   await prisma.user.upsert({
//     where: { email: 'admin@ecommerce.com' },
//     update: {},
//     create: {
//       email: 'admin@ecommerce.com',
//       name: 'Admin User',
//       password: hashedPassword,
//       role: { connect: { id: adminRole.id } },
//       status: 'active',
//     },
//   });

//   // Create customer user
//   const customerPassword = await bcrypt.hash('customer123', 10);
//   await prisma.user.upsert({
//     where: { email: 'customer@example.com' },
//     update: {},
//     create: {
//       email: 'customer@example.com',
//       name: 'John Customer',
//       password: customerPassword,
//       role: { connect: { id: customerRole.id } },
//       status: 'active',
//     },
//   });

//   // Create categories
//   const electronicsCategory = await prisma.category.upsert({
//     where: { id: 'electronics-cat-id' },
//     update: {},
//     create: {
//       id: 'electronics-cat-id',
//       name: 'Electronics',
//       description: 'Electronic devices and gadgets',
//       isActive: true,
//     },
//   });

//   const clothingCategory = await prisma.category.upsert({
//     where: { id: 'clothing-cat-id' },
//     update: {},
//     create: {
//       id: 'clothing-cat-id',
//       name: 'Clothing',
//       description: 'Fashion and apparel',
//       isActive: true,
//     },
//   });

//   const booksCategory = await prisma.category.upsert({
//     where: { id: 'books-cat-id' },
//     update: {},
//     create: {
//       id: 'books-cat-id',
//       name: 'Books',
//       description: 'Books and literature',
//       isActive: true,
//     },
//   });

//   // Create sample products
//   const products = [
//     {
//       name: 'iPhone 15 Pro',
//       description: 'Latest iPhone with advanced features',
//       price: 999.99,
//       sku: 'IPHONE15PRO',
//       categoryId: electronicsCategory.id,
//       isFeatured: true,
//       images: [
//         {
//           url: 'https://example.com/iphone15pro.jpg',
//           altText: 'iPhone 15 Pro',
//           isMain: true,
//           sortOrder: 0,
//         },
//       ],
//       inventory: {
//         quantity: 50,
//         reserved: 0,
//       },
//     },
//     {
//       name: 'MacBook Air M2',
//       description: 'Powerful laptop with M2 chip',
//       price: 1199.99,
//       sku: 'MACBOOKAIRM2',
//       categoryId: electronicsCategory.id,
//       isFeatured: true,
//       images: [
//         {
//           url: 'https://example.com/macbookair.jpg',
//           altText: 'MacBook Air M2',
//           isMain: true,
//           sortOrder: 0,
//         },
//       ],
//       inventory: {
//         quantity: 30,
//         reserved: 0,
//       },
//     },
//     {
//       name: 'Classic T-Shirt',
//       description: 'Comfortable cotton t-shirt',
//       price: 29.99,
//       sku: 'TSHIRT001',
//       categoryId: clothingCategory.id,
//       images: [
//         {
//           url: 'https://example.com/tshirt.jpg',
//           altText: 'Classic T-Shirt',
//           isMain: true,
//           sortOrder: 0,
//         },
//       ],
//       inventory: {
//         quantity: 100,
//         reserved: 0,
//       },
//     },
//     {
//       name: 'JavaScript: The Good Parts',
//       description: 'Essential JavaScript programming book',
//       price: 24.99,
//       sku: 'JSBOOK001',
//       categoryId: booksCategory.id,
//       images: [
//         {
//           url: 'https://example.com/jsbook.jpg',
//           altText: 'JavaScript Book',
//           isMain: true,
//           sortOrder: 0,
//         },
//       ],
//       inventory: {
//         quantity: 75,
//         reserved: 0,
//       },
//     },
//   ];

//   for (const productData of products) {
//     const { images, inventory, ...product } = productData;

//     await prisma.product.upsert({
//       where: { sku: product.sku },
//       update: {},
//       create: {
//         ...product,
//         images: {
//           create: images,
//         },
//         inventory: {
//           create: inventory,
//         },
//       },
//     });
//   }

//   console.log('Database seeded successfully!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
