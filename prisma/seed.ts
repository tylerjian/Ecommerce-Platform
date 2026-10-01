import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  // Electronics
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Fi sound quality. Perfect for travel, work, or leisure listening.",
    price: 299.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    category: "Electronics",
    stock: 45,
    featured: true,
  },
  {
    name: "Mechanical Gaming Keyboard",
    description:
      "RGB backlit mechanical keyboard with Cherry MX switches, anti-ghosting, and a detachable USB-C cable. Built for precision and durability.",
    price: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    category: "Electronics",
    stock: 30,
    featured: true,
  },
  {
    name: "4K Portable Monitor",
    description:
      "15.6-inch 4K USB-C portable display with HDR support, 60Hz refresh rate, and built-in speakers. Ideal for remote workers and gamers on the go.",
    price: 399.99,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    category: "Electronics",
    stock: 20,
    featured: false,
  },
  {
    name: "Smart Watch Series X",
    description:
      "Advanced smartwatch with health monitoring, GPS, 7-day battery life, and water resistance to 50m. Compatible with iOS and Android.",
    price: 249.99,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    category: "Electronics",
    stock: 60,
    featured: true,
  },

  // Clothing
  {
    name: "Merino Wool Crewneck Sweater",
    description:
      "Luxuriously soft 100% merino wool sweater with a classic crewneck design. Temperature-regulating, odor-resistant, and machine washable.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800",
    category: "Clothing",
    stock: 75,
    featured: true,
  },
  {
    name: "Technical Running Jacket",
    description:
      "Lightweight, windproof running jacket with 3M Scotchlite reflective detailing, zip pockets, and a packable design. Perfect for early morning runs.",
    price: 119.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    category: "Clothing",
    stock: 50,
    featured: false,
  },
  {
    name: "Slim Fit Chino Pants",
    description:
      "Versatile slim-fit chinos made from stretch cotton twill. Wrinkle-resistant, available in multiple colors, and suitable for both casual and smart-casual occasions.",
    price: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800",
    category: "Clothing",
    stock: 100,
    featured: false,
  },
  {
    name: "Premium Leather Sneakers",
    description:
      "Handcrafted full-grain leather sneakers with a cushioned insole and durable rubber outsole. Timeless style that pairs with almost any outfit.",
    price: 159.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    category: "Clothing",
    stock: 40,
    featured: true,
  },

  // Home & Living
  {
    name: "Pour-Over Coffee Maker Set",
    description:
      "Handblown borosilicate glass pour-over brewer with a matching carafe, reusable stainless steel filter, and walnut stand. Brews up to 600ml.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    category: "Home & Living",
    stock: 35,
    featured: true,
  },
  {
    name: "Bamboo Cutting Board Set",
    description:
      "Set of 3 organic bamboo cutting boards in graduated sizes. Naturally antibacterial, easy on knife blades, and eco-friendly. Includes juice grooves.",
    price: 44.99,
    imageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
    category: "Home & Living",
    stock: 80,
    featured: false,
  },
  {
    name: "Scented Soy Candle Collection",
    description:
      "Set of 4 hand-poured 100% soy wax candles in cedarwood, vanilla, eucalyptus, and lavender scents. Each burns up to 40 hours with a cotton wick.",
    price: 54.99,
    imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800",
    category: "Home & Living",
    stock: 90,
    featured: false,
  },
  {
    name: "Linen Duvet Cover Set",
    description:
      "100% stonewashed French linen duvet cover with two pillowcases. Breathable, temperature-regulating, and gets softer with every wash. Queen/Full size.",
    price: 189.99,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    category: "Home & Living",
    stock: 25,
    featured: true,
  },
];

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create a test customer
  const customerPassword = await hash("customer123456", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@example.com",
      password: customerPassword,
      role: "USER",
    },
  });
  console.log("Created customer user:", customer.email);

  // Seed products
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name }, // won't match, so always creates
      update: {},
      create: product,
    });
  }

  // Simpler: delete all and re-insert
  await prisma.product.deleteMany({});
  const created = await prisma.product.createMany({ data: products });
  console.log(`Created ${created.count} products`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
