-- ============================================================
-- SMARTCART AI - DATABASE INITIALIZATION SCRIPT
-- Version: 1.0
-- Database: MySQL 8.0+
--
-- Architecture:
--   auth_db           -> Auth Service
--   product_db        -> Product Service
--   inventory_db      -> Inventory Service
--   order_db          -> Order Service
--   payment_db        -> Payment Service
--   notification_db   -> Notification Service
--
-- IMPORTANT:
-- Microservices do NOT use physical foreign keys across databases.
-- Cross-service IDs (customer_id, seller_id, product_id, order_id)
-- are validated through service-to-service APIs.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. AUTH SERVICE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartcart_auth_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartcart_auth_db;

DROP TABLE IF EXISTS seller_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id),

    INDEX idx_users_role_id (role_id),
    INDEX idx_users_account_status (account_status)
) ENGINE=InnoDB;

CREATE TABLE seller_profiles (
    seller_profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    business_description TEXT,
    business_email VARCHAR(100),
    business_phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_seller_profile_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_seller_business_name (business_name)
) ENGINE=InnoDB;

INSERT INTO roles (role_name)
VALUES
    ('CUSTOMER'),
    ('SELLER'),
    ('ADMIN');

-- ============================================================
-- 2. PRODUCT SERVICE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartcart_product_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartcart_product_db;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    brand VARCHAR(100),
    sku VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id),

    CONSTRAINT chk_products_price
        CHECK (price >= 0),

    INDEX idx_products_category_id (category_id),
    INDEX idx_products_seller_id (seller_id),
    INDEX idx_products_status (status),
    INDEX idx_products_brand (brand),
    INDEX idx_products_name (product_name)
) ENGINE=InnoDB;

CREATE TABLE product_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,

    INDEX idx_product_images_product_id (product_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    rating INT NOT NULL,
    review_text TEXT,
    sentiment VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5),

    INDEX idx_reviews_product_id (product_id),
    INDEX idx_reviews_customer_id (customer_id),
    INDEX idx_reviews_sentiment (sentiment)
) ENGINE=InnoDB;

-- ============================================================
-- 3. INVENTORY SERVICE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartcart_inventory_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartcart_inventory_db;

DROP TABLE IF EXISTS inventory;

CREATE TABLE inventory (
    inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE,
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_inventory_available
        CHECK (available_quantity >= 0),

    CONSTRAINT chk_inventory_reserved
        CHECK (reserved_quantity >= 0),

    CONSTRAINT chk_inventory_reorder
        CHECK (reorder_level >= 0),

    INDEX idx_inventory_product_id (product_id),
    INDEX idx_inventory_low_stock (available_quantity, reorder_level)
) ENGINE=InnoDB;

-- ============================================================
-- 4. ORDER SERVICE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartcart_order_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartcart_order_db;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS addresses;

CREATE TABLE addresses (
    address_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    address_type VARCHAR(30) NOT NULL DEFAULT 'HOME',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_addresses_customer_id (customer_id)
) ENGINE=InnoDB;

CREATE TABLE carts (
    cart_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_carts_customer_id (customer_id)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
    cart_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_cart_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_cart_items_price
        CHECK (unit_price >= 0),

    CONSTRAINT uq_cart_product
        UNIQUE (cart_id, product_id),

    INDEX idx_cart_items_product_id (product_id)
) ENGINE=InnoDB;

CREATE TABLE orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    address_id BIGINT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    order_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,

    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id) REFERENCES addresses(address_id),

    CONSTRAINT chk_orders_total
        CHECK (total_amount >= 0),

    INDEX idx_orders_customer_id (customer_id),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_order_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_items_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_order_items_subtotal
        CHECK (subtotal >= 0),

    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id),
    INDEX idx_order_items_seller_id (seller_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. PAYMENT SERVICE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartcart_payment_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartcart_payment_db;

DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    gateway_order_id VARCHAR(255) UNIQUE,
    gateway_payment_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_payments_amount
        CHECK (amount >= 0),

    INDEX idx_payments_customer_id (customer_id),
    INDEX idx_payments_status (payment_status),
    INDEX idx_payments_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 6. NOTIFICATION SERVICE DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartcart_notification_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartcart_notification_db;

DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- OPTIONAL STARTER CATEGORIES
-- These can be changed later through the Product Service.
-- ============================================================

USE smartcart_product_db;

INSERT INTO categories (category_name, description)
VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Laptops', 'Laptops and notebook computers'),
    ('Mobile Phones', 'Smartphones and mobile devices'),
    ('Accessories', 'Computer and mobile accessories'),
    ('Books', 'Books and learning materials');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SMARTCART AI DATABASE SCRIPT
-- ============================================================
