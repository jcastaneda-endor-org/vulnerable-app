-- Initialize database with test data for SQL injection testing

USE vulnerable_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(50)
);

-- Insert test data
INSERT INTO users (id, username, password, email, role) VALUES
(1, 'admin', 'admin123', 'admin@example.com', 'admin'),
(2, 'user1', 'password123', 'user1@example.com', 'user'),
(3, 'test', 'test', 'test@example.com', 'user');

INSERT INTO products (name, description, price, category) VALUES
('Product 1', 'Test product description', 99.99, 'electronics'),
('Product 2', 'Another test product', 149.99, 'fashion');

