// Import modules
require('dotenv').config();
const mysql = require('mysql2/promise');

// Initialize the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Perform basic operations
async function main() {
    try {
        console.log('Connecting to MySQL Database...');
        
        // Create the 'categories' table if it doesn't exist
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS categories(
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("-> 'categories' table is ready.");

        // Insert data using a prepared statement
        const insertSql = `INSERT INTO categories (name, description) VALUES (?, ?)`;
        const [insertResult] = await pool.execute(insertSql, ['Food', 'Daily essentials']);

        console.log(`-> Inserted category ID: ${insertResult.insertId}`);

        // Select data
        const [rows] = await pool.execute('SELECT * FROM categories WHERE name = ?', ['Food']);

        // Update data
        const [updateResult] = await pool.execute(
            'UPDATE categories SET description = ? WHERE id = ?',
            ['Food, beverages and fresh food', insertResult.insertId]
        );
        
        console.log(`-> Number of updated rows: ${updateResult.affectedRows}`);
    } catch (error) {
        console.error('MySQL error:', error.message);
    } finally {
        await pool.end(); // Close connection
    }
}

// Build 'items' table in store_db
async function build_items_table() {
    try {
        console.log('Connecting to MySQL Database...');

        // Create the 'items' tables if it doesn't exist
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS items(
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT,
                item_name VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                quantity INT CHECK (quantity > 0),
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        `)
        console.log("-> 'items' table is ready.");
    } catch (error) {
        console.error('MySQL error:', error.message);
    } finally {
        await pool.end(); // Close connection
    }
}

// Create sample data
async function seedSampleData() {
    try {
        // Sample categories
        const categories = [
            ['Food', 'Daily essentials and groceries'],
            ['Electronics', 'Gadgets, phones and computers'],
            ['Clothing', 'Apparel and fashion items'],
            ['Books', 'Educational and entertainment books'],
            ['Home & Living', 'Furniture and home appliances'],
            ['Sports & Outdoors', 'Sporting goods and outdoor equipment']
        ];

        // Insert sample categories to 'categories' table
        for (const [name, description] of categories) {
            await pool.execute(
                'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
                [name, description]
            );
        }

        // Get category_id for each category name
        const categoryIds = {};
        for (const [name] of categories) {
            const [rows] = await pool.execute(
                'SELECT id FROM categories WHERE name = ?',
                [name]
            );

            categoryIds[name] = rows[0].id;
        }

        // Delete all products in 'items' table before inserting new ones
        await pool.execute('DELETE FROM items');

        // Sample items data
        const items = [
            [categoryIds['Food'], 'Apple', 25000, 100],
            [categoryIds['Food'], 'Milk', 32000, 50],
            [categoryIds['Food'], 'Bread', 15000, 30],
            [categoryIds['Electronics'], 'Smartphone', 5500000, 15],
            [categoryIds['Electronics'], 'Wireless Mouse', 250000, 40],
            [categoryIds['Clothing'], 'T-Shirt', 120000, 60],
            [categoryIds['Clothing'], 'Jeans', 350000, 25],
            [categoryIds['Books'], 'Node.js Programming', 180000, 20],
            [categoryIds['Home & Living'], 'Desk Lamp', 150000, 35],
            [categoryIds['Home & Living'], 'Coffee Mug', 45000, 80]
        ];

        for (const item of items) {
            await pool.execute(
                `INSERT INTO items
                (category_id, item_name, price, quantity)
                VALUES (?, ?, ?, ?)`,
                item
            );
        }

        console.log('-> Sample categories and items inserted successfully.');
    } catch (error) {
        console.error('MySQL error:', error.message);
    } finally {
        await pool.end(); // Close connection
    }
}

// Question 1:
async function question1() {
    try {
        console.log('Question 1...');

        const [rows] = await pool.execute(`
            SELECT * FROM items
            WHERE price >= 500000 AND quantity > 0
            ORDER BY price DESC
        `);
        console.log(rows);
        console.log("-> Retrieved successfully!");
    } catch (error) {
        console.error('MySQL error:', error.message);
    } finally {
        await pool.end(); // Close connection
    }
}

// Question 2:
async function searchByKeyword(keyword) {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM items
            WHERE item_name LIKE ?
        `, [`%${keyword}%`]);
        console.log(rows);
        console.log(`-> Search ${keyword} items successfully!\n`);
    } catch (error) {
        console.error('MySQL error:', error.message);
    }
}

async function question2() {
    console.log('Question 2...');
    console.log('-> Search for Gaming items...');
    await searchByKeyword("Gaming");
    console.log('-> Search for Wireless items...');
    await searchByKeyword("Wireless");
    await pool.end(); // Close connection
}

// Question 3:
async function question3() {
    try {
        console.log('Question 3...');

        const [rows] = await pool.execute(`
            SELECT
                SUM(quantity) AS total_stock_quantity,
                AVG(price) AS avg_price,
                COUNT(*) AS total_num_of_items
            FROM items
        `);
        console.log(rows);
        console.log("-> Calculated successfully!");
    } catch (error) {
        console.error('MySQL error:', error.message);
    } finally {
        await pool.end(); // Close connection
    }
}

// Question 4:
async function question4() {
    try {
        console.log('Question 4...');

        const [rows] = await pool.execute(`
            SELECT
                categories.id AS category_id,
                categories.name AS category_name,
                COUNT(*) AS number_of_items,
                SUM(items.price * items.quantity) AS total_value
            FROM items
            INNER JOIN categories ON items.category_id = categories.id
            GROUP BY categories.id, categories.name
            HAVING SUM(items.price * items.quantity) > 10000000
        `);
        console.log(rows);
        console.log("-> Calculated successfully!");
    } catch (error) {
        console.error('MySQL error:', error.message);
    } finally {
        await pool.end(); // Close connection
    }
}

question4();

