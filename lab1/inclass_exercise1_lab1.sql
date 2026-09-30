-- 1. Create the database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- 2. Create the users table (DDL)
CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the products table (DDL)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert sample data (DML - INSERT)
INSERT INTO users(full_name, email, password_hash, role) VALUES
('Nguyen Van Admin', 'admin@gmail.com', 'hash_pwd_123', 'admin'),
('Tran Thi User', 'user@gmail.com', 'hash_pwd_456', 'user');

INSERT INTO products(title, price, stock, category) VALUES
('Laptop Dell XPS 15', 35000000.00, 10, 'Electronics'),
('Keychron K2', 2200000.00, 25, 'Accessories'),
('Logitech MX Master 3S', 2500000.00, 15, 'Accessories');

-- E1. Extended the Database Structure (DDL)
-- E1.1. Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- E1.2 Create the order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- E2. Data Manipulation & SQL Queries (DML & DQL)
-- E2.Q1. Insert sample data
INSERT INTO orders(user_id, total_amount, status) VALUES
(1, 27400000.00, 'completed'),
(2, 1800000.00, 'pending'),
(1, 8500000.00, 'completed')

INSERT INTO order_items(order_id, product_id, quantity, price) VALUES
(1, 1, 1, 25000000.00),
(1, 2, 1, 2400000.00),
(2, 3, 1, 1800000.00);
(3, 2, 1, 8500000.00);

-- E2.Q2
SELECT * FROM products
WHERE price BETWEEN 100000 AND 1000000
ORDER BY price DESC;

-- E2.Q3
SELECT
    orders.id AS 'Order ID',
    users.full_name AS 'Customer Name',
    products.title AS 'Product Name',
    order_items.quantity AS 'Quantity',
    order_items.price AS 'Unit Price',
    orders.status AS 'Order Status'
FROM orders
INNER JOIN users ON orders.user_id = users.id
INNER JOIN order_items ON orders.id = order_items.order_id
INNER JOIN products ON order_items.product_id = products.id;

-- E2.Q4.S1
SELECT SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'completed';

-- E2.Q4.S2
SELECT user_id, COUNT(*) AS total_orders
FROM orders
GROUP BY user_id;