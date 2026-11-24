// Seed script: fills the database with sample categories and products.
// Usage: npm run seed
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/category.model');
const Product = require('./models/product.model');

const categories = [
  { name: 'Laptops' },
  { name: 'Audio' },
  { name: 'Accessories' }
];

// categoryName is only used here to link products to the categories above
const products = [
  { categoryName: 'Laptops', name: 'MacBook Air M3 13"', quantity: 12, price: 1099 },
  { categoryName: 'Laptops', name: 'Dell XPS 13', quantity: 5, price: 1299 },
  { categoryName: 'Audio', name: 'Sony WH-1000XM5', quantity: 15, price: 349 },
  { categoryName: 'Audio', name: 'AirPods Pro 2', quantity: 30, price: 249 },
  { categoryName: 'Accessories', name: 'Logitech MX Master 3S', quantity: 25, price: 99.99 },
  { categoryName: 'Accessories', name: 'Keychron K2 Keyboard', quantity: 8, price: 79.5 }
];

async function seed() {
  try {
    await connectDB();

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing categories and products');

    // Insert one at a time so createdAt differs between rows
    const createdCategories = {};
    for (const category of categories) {
      createdCategories[category.name] = await Category.create(category);
      console.log(`Category: ${category.name} -> ${createdCategories[category.name]._id}`);
    }

    for (const { categoryName, ...product } of products) {
      const created = await Product.create({
        ...product,
        categoryId: createdCategories[categoryName]._id
      });
      console.log(`Product:  ${created.name} (${categoryName}) -> ${created._id}`);
    }

    console.log('\nSeed done.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
