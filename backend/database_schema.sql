-- EliteHome Database Schema
-- Run this SQL to create the required tables

-- Users table with role and blocking functionality
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'owner', 'staff') DEFAULT 'staff',
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apartments table with owner linking
CREATE TABLE IF NOT EXISTS apartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL,
    type VARCHAR(50),
    employee VARCHAR(100),
    description TEXT,
    status VARCHAR(50),
    household TEXT,
    photo VARCHAR(255),
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apartment_id INT NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    item VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    description TEXT,
    proof VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

-- Finances table
CREATE TABLE IF NOT EXISTS finances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apartment_id INT NOT NULL,
    owner_name VARCHAR(100),
    tenant_name VARCHAR(100),
    checkin_date DATE,
    checkout_date DATE,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    expenses DECIMAL(10,2) DEFAULT 0,
    expense_description TEXT,
    proof VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

-- Notifications table for admin messages
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    message TEXT NOT NULL,
    apartment_tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample apartments
INSERT INTO apartments (number, type, employee, description, status, household) VALUES
('A101', 'Studio', 'John Doe', 'Modern studio apartment with city view', 'Available', 'Cleaning scheduled'),
('A102', '1-Bedroom', 'Jane Smith', 'Spacious 1-bedroom with balcony', 'Rented', 'Maintenance required'),
('A103', '2-Bedroom', 'Mike Johnson', 'Family-friendly 2-bedroom apartment', 'Available', 'Ready for viewing')
ON DUPLICATE KEY UPDATE number=number;
