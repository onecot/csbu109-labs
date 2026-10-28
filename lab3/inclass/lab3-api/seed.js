// Seed script: fills shop_lab3_db with sample products and categories for Postman testing.
// Usage: node seed.js   (or: npm run seed)
const mongoose = require('mongoose');
const Product = require('./models/product.model');
const Category = require('./models/category.model');

const MONGO_URI = 'mongodb://127.0.0.1:27017/shop_lab3_db';

const products = [
  {
    name: 'MacBook Air M3 13"',
    category: 'Electronics',
    price: 1099,
    stock: 12,
    description: '13-inch laptop, 8GB RAM, 256GB SSD'
  },
  {
    name: 'Dell XPS 13',
    category: 'Electronics',
    price: 1299,
    stock: 5,
    description: '13-inch ultrabook, Intel Core Ultra 7'
  },
  {
    name: 'iPad Air 11"',
    category: 'Electronics',
    price: 599,
    stock: 20,
    description: 'M2 chip, 128GB, Wi-Fi'
  },
  {
    name: 'Sony WH-1000XM5',
    category: 'Audio',
    price: 349,
    stock: 15,
    description: 'Wireless noise-cancelling over-ear headphones'
  },
  {
    name: 'AirPods Pro 2',
    category: 'Audio',
    price: 249,
    stock: 30,
    description: 'Wireless earbuds with active noise cancellation'
  },
  {
    name: 'JBL Flip 6',
    category: 'Audio',
    price: 99,
    stock: 0,
    description: 'Portable Bluetooth speaker, IP67 waterproof'
  },
  {
    name: 'Logitech MX Master 3S',
    category: 'Accessories',
    price: 99.99,
    stock: 25,
    description: 'Ergonomic wireless mouse, 8K DPI'
  },
  {
    name: 'Keychron K2 Keyboard',
    category: 'Accessories',
    price: 79.5,
    stock: 8,
    description: '75% mechanical keyboard, hot-swappable'
  },
  {
    name: 'Anker USB-C Cable 2m',
    category: 'Accessories',
    price: 15.99,
    stock: 100,
    description: 'Braided 100W charging cable'
  },
  {
    name: 'Laptop Stand Aluminium',
    category: 'Accessories',
    price: 39,
    stock: 40,
    description: 'Adjustable height, fits 11-17 inch laptops'
  }
];

// 12 categories: enough to exercise page/limit pagination (req 7) later.
// slug is written by hand here because the auto-slug hook (req 3) is out of scope.
const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Laptops, tablets and computer hardware' },
  { name: 'Audio', slug: 'audio', description: 'Headphones, earbuds and speakers' },
  { name: 'Accessories', slug: 'accessories', description: 'Keyboards, mice, cables and stands' },
  { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor and household items' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Cookware, tableware and small appliances' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Fitness gear, camping and hiking equipment' },
  { name: 'Books & Stationery', slug: 'books-stationery', description: 'Books, notebooks and office supplies' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes and bags' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Skincare, haircare and grooming products' },
  { name: 'Toys & Games', slug: 'toys-games', description: 'Board games, puzzles and children toys' },
  { name: 'Health & Wellness', slug: 'health-wellness', description: 'Supplements, monitors and wellness devices' },
  { name: 'Automotive', slug: 'automotive', description: 'Car care, tools and vehicle accessories' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);

    const removedProducts = await Product.deleteMany({});
    console.log(`Removed ${removedProducts.deletedCount} existing product(s)`);

    // Insert one at a time so createdAt differs (list endpoint sorts by createdAt desc)
    const createdProducts = [];
    for (const product of products) {
      createdProducts.push(await Product.create(product));
    }

    console.log(`Inserted ${createdProducts.length} products\n`);
    console.log('ID                       | Category    | Price  | Stock | Name');
    console.log('-------------------------|-------------|--------|-------|---------------------------');
    for (const p of createdProducts) {
      console.log(
        `${p._id.toString()} | ${p.category.padEnd(11)} | ${String(p.price).padEnd(6)} | ${String(p.stock).padEnd(5)} | ${p.name}`
      );
    }

    const removedCategories = await Category.deleteMany({});
    console.log(`\nRemoved ${removedCategories.deletedCount} existing category(ies)`);

    const createdCategories = [];
    for (const category of categories) {
      createdCategories.push(await Category.create(category));
    }

    console.log(`Inserted ${createdCategories.length} categories\n`);
    console.log('ID                       | Slug                  | Name');
    console.log('-------------------------|-----------------------|---------------------------');
    for (const c of createdCategories) {
      console.log(`${c._id.toString()} | ${c.slug.padEnd(21)} | ${c.name}`);
    }

    await mongoose.disconnect();
    console.log('\nDone. Sample data is ready for Postman tests.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
