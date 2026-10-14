// Import modules
require('dotenv').config();
const mysql = require('mysql2/promise');

// Initalize the connection pool
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

async function createTables() {
    try {
        console.log("Connecting to MySQL Database...");
        console.log("\n-> Creating tables...");
        
        // DROP existed tables
        await pool.execute(`DROP TABLE IF EXISTS order_items;`);
        await pool.execute(`DROP TABLE IF EXISTS orders;`);
        await pool.execute(`DROP TABLE IF EXISTS customers;`);
        await pool.execute(`DROP TABLE IF EXISTS products;`);
        
        // CREATE the 'customers' table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS customers(
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                balance DECIMAL(12,2) DEFAULT 0
            )
        `)

        // CREATE the 'products' table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS products(
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_name VARCHAR(150) NOT NULL,
                price DECIMAL(12,2) NOT NULL,
                stock INT NOT NULL
            )
        `)

        // CREATE the 'orders' table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS orders(
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                total_amount DECIMAL(12,2) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `)

        // CREATE the 'order_items' table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS order_items(
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(12,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `)

        console.log("-> customers, products, orders, and order_items tables are ready!")
    } catch(error) {
        console.error('MySQL error:', error.message);
    }
}

async function createSampleData() {
    try {
        console.log("\n-> Creating sample data...");

        // CREATE sample customers
        await pool.execute(`
            INSERT INTO customers(full_name, balance) VALUES
            ('Le Minh Tan', 20000000),
            ('Nguyen Tri Nhan', 500000);
        `)

        // CREATE sample products
        await pool.execute(`
            INSERT INTO products(product_name, price, stock) VALUES
            ('Laptop Dell XPS', 15000000, 10),
            ('Logitech Mouse', 500000, 0);
        `)

        console.log("-> Create sample data succesfully!")
    } catch(error) {
        console.error("MySQL error:", error.message);
    }
}

async function transactionWorkflow(customer_id, product_id, quantity) {
    // Open SQL transaction
    console.log("\n-> Begin transaction...")
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        console.log(`   + Customer ${customer_id} is buying product ${product_id}...`)

        // Step 1. SELECT balance/stock + check
        const [customerQuery] = await conn.execute(`SELECT balance FROM customers WHERE id=?`, [customer_id]);
        const [productQuery] = await conn.execute(`SELECT price, stock FROM products WHERE id=?`, [product_id]);
        
        if(!customerQuery[0]) throw new Error("Customer not found");
        if(!productQuery[0]) throw new Error("Product not found");

        const balance = customerQuery[0].balance;
        const price = Number(productQuery[0].price);
        const totalOrder = price * quantity;
        const stock = productQuery[0].stock;

        if(quantity > stock) throw new Error("Not enough stock");
        if(balance < totalOrder) throw new Error("Not enough balance");

        // Step 2. UPDATE customers
        await conn.execute(`UPDATE customers SET balance = balance - ? WHERE id=?;`, [totalOrder, customer_id]);

        // Step 3. UPDATE products
        await conn.execute(`UPDATE products SET stock = stock - ? WHERE id=?;`, [quantity, product_id]);
        
        // Step 4. INSERT orders
        const [newOrder] = await conn.execute(`
            INSERT INTO orders(customer_id, total_amount) VALUES (?, ?);
        `, [customer_id, totalOrder]);

        // Step 5. INSERT order_items
        await conn.execute(`
            INSERT INTO order_items(order_id, product_id, quantity, price) VALUES (?, ?, ?, ?);
        `, [newOrder.insertId, product_id, quantity, price]);

        await conn.commit();    // all OK -> save
        console.log("   -> Transaction successful.")
    } catch(error) {
        console.error("   -> Transaction failed:", error.message)
        await conn.rollback();  // any fail -> undo all
    } finally {
        conn.release();
    }
}

async function runAll() {
    try {
        await createTables();
        await createSampleData();
        await transactionWorkflow(1, 1, 1);
        await transactionWorkflow(2, 1, 1);
        await transactionWorkflow(1, 2, 1);
    } finally {
        await pool.end(); // Close connection
    }
}

runAll();