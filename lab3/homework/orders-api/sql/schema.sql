-- Lab 3 homework: orders & inventory schema (MySQL 8)
-- Run: mysql -u root < sql/schema.sql

CREATE DATABASE IF NOT EXISTS ecommerce_order_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce_order_db;

-- Drop in dependency order (order_items -> orders -> products -> customers)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(150) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_customer (customer_id)
) ENGINE = InnoDB;

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------- sample data
INSERT INTO customers (id, full_name, email, phone) VALUES
  (1, 'Alice Nguyen', 'alice@example.com', '0901234567'),
  (2, 'Bao Tran', 'bao@example.com', '0912345678'),
  (3, 'Chi Le', 'chi@example.com', '0923456789'),
  (4, 'Dung Pham', 'dung@example.com', '0934567890');

INSERT INTO products (id, product_name, price, stock) VALUES
  (1, 'iPhone 15', 999.00, 10),
  (2, 'AirPods Pro 2', 249.00, 20),
  (3, 'MacBook Air M3', 1099.00, 5),
  (4, 'Logitech MX Master 3S', 99.99, 30),
  (5, 'Keychron K2 Keyboard', 79.50, 15),
  (6, 'JBL Flip 6', 129.00, 8);

-- Order 1: completed, 2 x iPhone 15 + 1 x AirPods Pro 2 = 2247.00
INSERT INTO orders (id, customer_id, status, total_amount) VALUES
  (1, 1, 'completed', 2247.00);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 2, 999.00),
  (1, 2, 1, 249.00);

-- Order 2: completed, 1 x MacBook Air M3 + 2 x MX Master 3S = 1298.98
INSERT INTO orders (id, customer_id, status, total_amount) VALUES
  (2, 2, 'completed', 1298.98);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (2, 3, 1, 1099.00),
  (2, 4, 2, 99.99);

-- Order 3: pending, 2 x Keychron K2 = 159.00
INSERT INTO orders (id, customer_id, status, total_amount) VALUES
  (3, 1, 'pending', 159.00);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (3, 5, 2, 79.50);

-- Order 4: cancelled, 2 x JBL Flip 6 = 258.00
INSERT INTO orders (id, customer_id, status, total_amount) VALUES
  (4, 3, 'cancelled', 258.00);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (4, 6, 2, 129.00);
