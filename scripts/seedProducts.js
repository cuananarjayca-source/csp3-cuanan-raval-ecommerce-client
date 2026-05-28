/**
 * Optional seed script: node scripts/seedProducts.js
 * Populates sample products for Home featured section and catalog filters.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");

const samples = [
    {
        name: "Wireless Noise-Canceling Headphones",
        description: "Premium over-ear headphones with 30-hour battery life.",
        price: 249.99,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
        stock: 42,
        featured: true,
    },
    {
        name: "Organic Cotton Hoodie",
        description: "Soft unisex hoodie made from sustainable cotton.",
        price: 59.99,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"],
        stock: 120,
        featured: true,
    },
    {
        name: "Ceramic Pour-Over Coffee Set",
        description: "Handcrafted dripper and carafe for the perfect brew.",
        price: 38.5,
        category: "Home & Garden",
        images: ["https://images.unsplash.com/photo-1514432353619-815f8b84df06?w=400"],
        stock: 28,
        featured: true,
    },
    {
        name: "Trail Running Shoes",
        description: "Lightweight grip for rocky paths and wet terrain.",
        price: 129.0,
        category: "Sports",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
        stock: 65,
        featured: false,
    },
    {
        name: "Vue 3 Composition API Guide",
        description: "Deep dive into reactive state and script setup patterns.",
        price: 34.99,
        category: "Books",
        images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
        stock: 200,
        featured: false,
    },
    {
        name: "Smart Home Hub",
        description: "Control lights, locks, and sensors from one dashboard.",
        price: 89.99,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=400"],
        stock: 15,
        featured: true,
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_STRING);
    await Product.deleteMany({});
    await Product.insertMany(samples);
    console.log(`Seeded ${samples.length} products.`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
