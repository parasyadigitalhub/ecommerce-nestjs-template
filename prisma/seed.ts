import {
  PrismaClient,
  Roles,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CoupounConditions,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clear existing data (optional - uncomment if needed)
  // await clearDatabase();

  try {
    // 1. Create Users with different roles
    console.log('👥 Creating users...');
    const users = await createUsers();

    // 2. Create Customer, Admin, and Delivery Agent Profiles
    console.log('📋 Creating user profiles...');
    const profiles = await createUserProfiles(users);

    // 3. Create Categories
    console.log('🏷️ Creating categories...');
    const categories = await createCategories();

    // 4. Create Brands
    console.log('🏢 Creating brands...');
    const brands = await createBrands();

    // 5. Create Products with variations and inventory
    console.log('📦 Creating products...');
    const products = await createProducts(categories, brands);

    // 6. Create Addresses
    console.log('🏠 Creating addresses...');
    const addresses = await createAddresses(users);

    // 7. Create Cart Items
    console.log('🛒 Creating cart items...');
    await createCartItems(users, products);

    // 8. Create Coupons
    console.log('🎫 Creating coupons...');
    const coupons = await createCoupons();

    // 9. Create Orders with Order Items and Payments
    console.log('📝 Creating orders...');
    const orders = await createOrders(users, products, addresses);

    // 10. Create Reviews
    console.log('⭐ Creating reviews...');
    await createReviews(users, products);

    // 11. Create Coupon Usage
    console.log('💸 Creating coupon usages...');
    await createCouponUsages(users, coupons);

    // 12. Create User OTPs
    console.log('🔐 Creating user OTPs...');
    await createUserOTPs(users);

    console.log('✅ Database seeded successfully!');
    console.log(`Created:
    - ${users.length} users with profiles
    - ${categories.length} categories
    - ${brands.length} brands
    - ${products.length} products
    - ${addresses.length} addresses
    - ${orders.length} orders
    - ${coupons.length} coupons
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Optional: Clear all data (use carefully)
async function clearDatabase() {
  console.log('🧹 Clearing existing data...');

  const tableNames = [
    'CouponUsage',
    'UserOtp',
    'Review',
    'Payment',
    'OrderItem',
    'Order',
    'CartItem',
    'Address',
    'Inventory',
    'ProductVariant',
    'ProductImage',
    'Product',
    'Brand',
    'Category',
    'Coupon',
    'DeliveryAgentProfile',
    'AdminProfile',
    'CustomerProfile',
    'User',
  ];

  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tableName.toLowerCase()}" RESTART IDENTITY CASCADE;`,
      );
    } catch (error) {
      console.warn(`Could not truncate ${tableName}:`, error.message);
    }
  }
}

// 1. Create Users
async function createUsers() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      name: 'Super Admin',
      email: 'superadmin@ecommerce.com',
      phone: '+1234567890',
      role: Roles.SUPER_ADMIN,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Store Admin',
      email: 'admin@ecommerce.com',
      phone: '+1234567891',
      role: Roles.ADMIN,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Store Manager',
      email: 'manager@ecommerce.com',
      phone: '+1234567892',
      role: Roles.STORE_MANAGER,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Product Manager',
      email: 'productmanager@ecommerce.com',
      phone: '+1234567893',
      role: Roles.PRODUCT_MANAGER,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'John Customer',
      email: 'john@customer.com',
      phone: '+1234567894',
      role: Roles.CUSTOMER,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Jane Customer',
      email: 'jane@customer.com',
      phone: '+1234567895',
      role: Roles.CUSTOMER,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Mike Delivery',
      email: 'mike@delivery.com',
      phone: '+1234567896',
      role: Roles.DELIVERY,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Customer Support',
      email: 'support@ecommerce.com',
      phone: '+1234567897',
      role: Roles.CUSTOMER_SUPPORT,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Marketing Manager',
      email: 'marketing@ecommerce.com',
      phone: '+1234567898',
      role: Roles.MARKETING_MANAGER,
      status: UserStatus.active,
      password: hashedPassword,
    },
    {
      name: 'Guest User',
      email: 'guest@example.com',
      phone: '+1234567899',
      role: Roles.GUEST,
      status: UserStatus.active,
      password: hashedPassword,
    },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    users.push(user);
  }

  return users;
}

// 2. Create User Profiles
async function createUserProfiles(users: any[]) {
  const profiles = {
    customers: [],
    admins: [],
    deliveryAgents: [],
  };

  for (const user of users) {
    // Create Customer Profiles
    if (user.role === Roles.CUSTOMER || user.role === Roles.GUEST) {
      const profile = await prisma.customerProfile.create({
        data: { userId: user.id },
      });
      profiles.customers.push(profile);
    }

    // Create Admin Profiles
    if (
      [
        Roles.SUPER_ADMIN,
        Roles.ADMIN,
        Roles.STORE_MANAGER,
        Roles.PRODUCT_MANAGER,
        Roles.MARKETING_MANAGER,
        Roles.CUSTOMER_SUPPORT,
      ].includes(user.role)
    ) {
      const profile = await prisma.adminProfile.create({
        data: {
          userId: user.id,
          notes: `Admin profile for ${user.name} with role ${user.role}`,
        },
      });
      profiles.admins.push(profile);
    }

    // Create Delivery Agent Profiles
    if (user.role === Roles.DELIVERY) {
      const profile = await prisma.deliveryAgentProfile.create({
        data: {
          userId: user.id,
          vehicleNumber: `DEL${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0')}`,
          vehicleType: 'motorcycle',
          assignedArea: 'Downtown',
          availability: true,
          rating: 4.5,
          totalDeliveries: Math.floor(Math.random() * 50),
        },
      });
      profiles.deliveryAgents.push(profile);
    }
  }

  return profiles;
}

// 3. Create Categories
async function createCategories() {
  const categoriesData = [
    {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      image: 'https://example.com/images/electronics.jpg',
      isActive: true,
    },
    {
      name: 'Clothing & Fashion',
      description: 'Fashion, apparel and accessories',
      image: 'https://example.com/images/clothing.jpg',
      isActive: true,
    },
    {
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      image: 'https://example.com/images/home-garden.jpg',
      isActive: true,
    },
    {
      name: 'Books',
      description: 'Books, e-books and magazines',
      image: 'https://example.com/images/books.jpg',
      isActive: true,
    },
    {
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      image: 'https://example.com/images/sports.jpg',
      isActive: true,
    },
  ];

  const categories = [];
  for (const categoryData of categoriesData) {
    const category = await prisma.category.upsert({
      where: {
        id: `cat-${categoryData.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: {
        ...categoryData,
        id: `cat-${categoryData.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
    });
    categories.push(category);
  }

  // Create subcategories
  const subcategoriesData = [
    { name: 'Smartphones', parentName: 'Electronics' },
    { name: 'Laptops', parentName: 'Electronics' },
    { name: "Men's Clothing", parentName: 'Clothing & Fashion' },
    { name: "Women's Clothing", parentName: 'Clothing & Fashion' },
    { name: 'Furniture', parentName: 'Home & Garden' },
    { name: 'Fiction', parentName: 'Books' },
    { name: 'Fitness Equipment', parentName: 'Sports & Outdoors' },
  ];

  for (const subData of subcategoriesData) {
    const parent = categories.find((cat) => cat.name === subData.parentName);
    if (parent) {
      const subcategory = await prisma.category.create({
        data: {
          name: subData.name,
          description: `${subData.name} in ${subData.parentName}`,
          parentId: parent.id,
          isActive: true,
        },
      });
      categories.push(subcategory);
    }
  }

  return categories;
}

// 4. Create Brands
async function createBrands() {
  const brandsData = [
    {
      name: 'Apple',
      slug: 'apple',
      description: 'Premium technology products',
      logoUrl: 'https://example.com/brands/apple-logo.png',
      website: 'https://apple.com',
      country: 'USA',
      foundedYear: 1976,
      isFeatured: true,
    },
    {
      name: 'Samsung',
      slug: 'samsung',
      description: 'Innovative electronics and technology',
      logoUrl: 'https://example.com/brands/samsung-logo.png',
      website: 'https://samsung.com',
      country: 'South Korea',
      foundedYear: 1938,
      isFeatured: true,
    },
    {
      name: 'Nike',
      slug: 'nike',
      description: 'Athletic footwear and apparel',
      logoUrl: 'https://example.com/brands/nike-logo.png',
      website: 'https://nike.com',
      country: 'USA',
      foundedYear: 1964,
      isFeatured: true,
    },
    {
      name: 'Adidas',
      slug: 'adidas',
      description: 'Sports clothing and accessories',
      logoUrl: 'https://example.com/brands/adidas-logo.png',
      website: 'https://adidas.com',
      country: 'Germany',
      foundedYear: 1949,
      isFeatured: true,
    },
    {
      name: 'IKEA',
      slug: 'ikea',
      description: 'Ready-to-assemble furniture and home accessories',
      logoUrl: 'https://example.com/brands/ikea-logo.png',
      website: 'https://ikea.com',
      country: 'Sweden',
      foundedYear: 1943,
      isFeatured: false,
    },
  ];

  const brands = [];
  for (const brandData of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandData.slug },
      update: {},
      create: brandData,
    });
    brands.push(brand);
  }

  return brands;
}

// 5. Create Products
async function createProducts(categories: any[], brands: any[]) {
  const electronicsCategory = categories.find(
    (cat) => cat.name === 'Electronics',
  );
  const smartphoneCategory = categories.find(
    (cat) => cat.name === 'Smartphones',
  );
  const laptopCategory = categories.find((cat) => cat.name === 'Laptops');
  const clothingCategory = categories.find(
    (cat) => cat.name === 'Clothing & Fashion',
  );
  const menClothingCategory = categories.find(
    (cat) => cat.name === "Men's Clothing",
  );
  const homeCategory = categories.find((cat) => cat.name === 'Home & Garden');
  const furnitureCategory = categories.find((cat) => cat.name === 'Furniture');

  const appleBrand = brands.find((brand) => brand.slug === 'apple');
  const samsungBrand = brands.find((brand) => brand.slug === 'samsung');
  const nikeBrand = brands.find((brand) => brand.slug === 'nike');
  const ikeaBrand = brands.find((brand) => brand.slug === 'ikea');

  const productsData = [
    {
      name: 'iPhone 15 Pro',
      description:
        'The most advanced iPhone with titanium design and A17 Pro chip',
      price: 999.99,
      comparePrice: 1099.99,
      sku: 'IPHONE15PRO',
      barcode: '123456789001',
      weight: 0.221,
      dimensions: '6.1 x 2.78 x 0.32 inches',
      isActive: true,
      isFeatured: true,
      categoryId: smartphoneCategory?.id || electronicsCategory.id,
      brandId: appleBrand.id,
      images: [
        {
          url: 'https://example.com/iphone15pro-1.jpg',
          altText: 'iPhone 15 Pro Front',
          isMain: true,
          sortOrder: 0,
        },
        {
          url: 'https://example.com/iphone15pro-2.jpg',
          altText: 'iPhone 15 Pro Back',
          isMain: false,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: 'Storage',
          value: '128GB',
          price: 999.99,
          sku: 'IPHONE15PRO-128',
        },
        {
          name: 'Storage',
          value: '256GB',
          price: 1099.99,
          sku: 'IPHONE15PRO-256',
        },
        {
          name: 'Storage',
          value: '512GB',
          price: 1299.99,
          sku: 'IPHONE15PRO-512',
        },
      ],
      inventory: { quantity: 50, reserved: 5, location: 'Warehouse A' },
    },
    {
      name: 'MacBook Air M2',
      description:
        'Supercharged by M2 chip for incredible performance and battery life',
      price: 1199.99,
      comparePrice: 1299.99,
      sku: 'MACBOOKAIR-M2',
      barcode: '123456789002',
      weight: 1.24,
      dimensions: '11.97 x 8.46 x 0.44 inches',
      isActive: true,
      isFeatured: true,
      categoryId: laptopCategory?.id || electronicsCategory.id,
      brandId: appleBrand.id,
      images: [
        {
          url: 'https://example.com/macbook-air-1.jpg',
          altText: 'MacBook Air M2',
          isMain: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: 'RAM', value: '8GB', price: 1199.99 },
        { name: 'RAM', value: '16GB', price: 1399.99 },
      ],
      inventory: { quantity: 30, reserved: 3, location: 'Warehouse A' },
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description:
        'Most powerful Galaxy smartphone with S Pen and advanced AI features',
      price: 1299.99,
      comparePrice: 1399.99,
      sku: 'GALAXY-S24-ULTRA',
      barcode: '123456789003',
      weight: 0.232,
      dimensions: '6.4 x 3.11 x 0.34 inches',
      isActive: true,
      isFeatured: true,
      categoryId: smartphoneCategory?.id || electronicsCategory.id,
      brandId: samsungBrand.id,
      images: [
        {
          url: 'https://example.com/galaxy-s24-ultra-1.jpg',
          altText: 'Galaxy S24 Ultra',
          isMain: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: 'Storage', value: '256GB', price: 1299.99 },
        { name: 'Storage', value: '512GB', price: 1499.99 },
      ],
      inventory: { quantity: 40, reserved: 4, location: 'Warehouse B' },
    },
    {
      name: 'Nike Air Max 90',
      description: 'Classic running shoe with visible Air cushioning',
      price: 120.0,
      comparePrice: 140.0,
      sku: 'NIKE-AIRMAX90',
      barcode: '123456789004',
      weight: 0.85,
      dimensions: '12 x 4.5 x 5 inches',
      isActive: true,
      isFeatured: false,
      categoryId: menClothingCategory?.id || clothingCategory.id,
      brandId: nikeBrand.id,
      images: [
        {
          url: 'https://example.com/nike-airmax90-1.jpg',
          altText: 'Nike Air Max 90',
          isMain: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: 'Size', value: '8', price: 120.0 },
        { name: 'Size', value: '9', price: 120.0 },
        { name: 'Size', value: '10', price: 120.0 },
        { name: 'Size', value: '11', price: 120.0 },
      ],
      inventory: { quantity: 100, reserved: 10, location: 'Warehouse C' },
    },
    {
      name: 'IKEA BILLY Bookcase',
      description: 'Narrow bookcase, white, perfect for small spaces',
      price: 60.0,
      sku: 'IKEA-BILLY-WHITE',
      barcode: '123456789005',
      weight: 23.1,
      dimensions: '15.75 x 11 x 79.5 inches',
      isActive: true,
      isFeatured: false,
      categoryId: furnitureCategory?.id || homeCategory.id,
      brandId: ikeaBrand.id,
      images: [
        {
          url: 'https://example.com/ikea-billy-1.jpg',
          altText: 'IKEA BILLY Bookcase',
          isMain: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: 'Color', value: 'White', price: 60.0 },
        { name: 'Color', value: 'Black-brown', price: 65.0 },
      ],
      inventory: { quantity: 25, reserved: 2, location: 'Warehouse D' },
    },
  ];

  const products = [];
  for (const productData of productsData) {
    const { images, variants, inventory, ...product } = productData;

    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        images: { create: images },
        variants: { create: variants || [] },
        inventory: { create: inventory },
      },
    });

    products.push(createdProduct);
  }

  return products;
}

// 6. Create Addresses
async function createAddresses(users: any[]) {
  const customerUsers = users.filter((user) => user.role === Roles.CUSTOMER);

  const addressesData = [
    {
      type: 'shipping',
      firstName: 'John',
      lastName: 'Customer',
      company: 'Tech Corp',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '+1234567894',
      isDefault: true,
    },
    {
      type: 'billing',
      firstName: 'John',
      lastName: 'Customer',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '+1234567894',
      isDefault: true,
    },
    {
      type: 'shipping',
      firstName: 'Jane',
      lastName: 'Customer',
      address1: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
      phone: '+1234567895',
      isDefault: true,
    },
  ];

  const addresses = [];
  let addressIndex = 0;

  for (const user of customerUsers) {
    if (addressIndex < addressesData.length) {
      const addressData = addressesData[addressIndex];
      const address = await prisma.address.create({
        data: {
          ...addressData,
          userId: user.id,
        },
      });
      addresses.push(address);
      addressIndex++;
    }
  }

  return addresses;
}

// 7. Create Cart Items
async function createCartItems(users: any[], products: any[]) {
  const customerUsers = users.filter((user) => user.role === Roles.CUSTOMER);

  const cartItems = [];
  for (let i = 0; i < Math.min(customerUsers.length, 2); i++) {
    const user = customerUsers[i];
    const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const product of randomProducts) {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
      });
      cartItems.push(cartItem);
    }
  }

  return cartItems;
}

// 8. Create Coupons
async function createCoupons() {
  const couponsData = [
    {
      coupon_code: 'WELCOME10',
      condition: CoupounConditions.first_user,
      description: 'Welcome discount for first-time users',
      minimum_purchase_value: 50.0,
      discount_amount: 10.0,
      usage_limit_per_person: 1,
      is_valid: true,
    },
    {
      coupon_code: 'SAVE20',
      condition: CoupounConditions.purchase_coupoun,
      description: 'Save $20 on orders over $100',
      minimum_purchase_value: 100.0,
      discount_amount: 20.0,
      usage_limit_per_person: 3,
      is_valid: true,
    },
    {
      coupon_code: 'ELECTRONICS15',
      condition: CoupounConditions.purchase_coupoun,
      description: 'Special discount on electronics',
      minimum_purchase_value: 200.0,
      discount_amount: 30.0,
      usage_limit_per_person: 2,
      is_valid: true,
    },
  ];

  const coupons = [];
  for (const couponData of couponsData) {
    const coupon = await prisma.coupon.upsert({
      where: { coupon_code: couponData.coupon_code },
      update: {},
      create: couponData,
    });
    coupons.push(coupon);
  }

  return coupons;
}

// 9. Create Orders
async function createOrders(users: any[], products: any[], addresses: any[]) {
  const customerUsers = users.filter((user) => user.role === Roles.CUSTOMER);

  const orders = [];
  for (let i = 0; i < Math.min(customerUsers.length, 3); i++) {
    const user = customerUsers[i];
    const userAddress = addresses.find((addr) => addr.userId === user.id);
    const orderProducts = products.sort(() => 0.5 - Math.random()).slice(0, 2);

    const orderItems = orderProducts.map((product) => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 2) + 1,
      price: parseFloat(product.price.toString()),
      total:
        parseFloat(product.price.toString()) *
        (Math.floor(Math.random() * 2) + 1),
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: `ORD-${Date.now()}-${i}`,
        status:
          i === 0
            ? OrderStatus.delivered
            : i === 1
              ? OrderStatus.shipped
              : OrderStatus.pending,
        totalAmount: totalAmount,
        shippingCost: 10.0,
        taxAmount: totalAmount * 0.08,
        discountAmount: i === 0 ? 10.0 : 0,
        shippingAddressId: userAddress?.id,
        billingAddressId: userAddress?.id,
        items: {
          create: orderItems,
        },
        payments: {
          create: {
            amount: totalAmount + 10.0,
            method: PaymentMethod.credit_card,
            status: PaymentStatus.completed,
            transactionId: `TXN-${Date.now()}-${i}`,
          },
        },
      },
    });

    orders.push(order);
  }

  return orders;
}

// 10. Create Reviews
async function createReviews(users: any[], products: any[]) {
  const customerUsers = users.filter((user) => user.role === Roles.CUSTOMER);

  const reviewsData = [
    {
      rating: 5,
      title: 'Excellent product!',
      comment: 'Really satisfied with the quality and performance.',
    },
    {
      rating: 4,
      title: 'Good value',
      comment: 'Works well, great value for money.',
    },
    {
      rating: 5,
      title: 'Highly recommend',
      comment: 'Perfect for my needs, would buy again.',
    },
    {
      rating: 3,
      title: 'Average product',
      comment: "It's okay, nothing special but does the job.",
    },
    {
      rating: 4,
      title: 'Pretty good',
      comment: 'Good quality, fast delivery.',
    },
  ];

  const reviews = [];
  for (let i = 0; i < Math.min(customerUsers.length, products.length); i++) {
    const user = customerUsers[i];
    const product = products[i];
    const reviewData = reviewsData[i % reviewsData.length];

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId: product.id,
        ...reviewData,
        isVerified: true,
      },
    });
    reviews.push(review);
  }

  return reviews;
}

// 11. Create Coupon Usage
async function createCouponUsages(users: any[], coupons: any[]) {
  const customerUsers = users.filter((user) => user.role === Roles.CUSTOMER);

  const couponUsages = [];
  for (let i = 0; i < Math.min(customerUsers.length, 2); i++) {
    const user = customerUsers[i];
    const coupon = coupons[i % coupons.length];

    const usage = await prisma.couponUsage.create({
      data: {
        userId: user.id,
        couponId: coupon.id,
      },
    });
    couponUsages.push(usage);
  }

  return couponUsages;
}

// 12. Create User OTPs
async function createUserOTPs(users: any[]) {
  const customerUsers = users.filter((user) => user.role === Roles.CUSTOMER);

  const otps = [];
  for (let i = 0; i < Math.min(customerUsers.length, 2); i++) {
    const user = customerUsers[i];

    const otp = await prisma.userOtp.create({
      data: {
        userId: user.id,
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        used: false,
      },
    });
    otps.push(otp);
  }

  return otps;
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
