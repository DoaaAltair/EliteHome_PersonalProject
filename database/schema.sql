CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'owner', 'tenant', 'staff')),
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) DEFAULT 'rent' CHECK (type IN ('rent', 'sale')),
    employee VARCHAR(255) DEFAULT NULL,
    owner_name VARCHAR(100) DEFAULT NULL,
    number VARCHAR(50) DEFAULT NULL,
    description TEXT,
    status VARCHAR(10) DEFAULT 'empty' CHECK (status IN ('rented', 'empty')),
    household TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id INTEGER DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    photo VARCHAR(255) DEFAULT NULL,
    CONSTRAINT apartments_owner_id_fk FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS apartments_owner_id_idx ON apartments(owner_id);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    item VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proof VARCHAR(255) DEFAULT NULL,
    currency VARCHAR(3) DEFAULT '₺',
    CONSTRAINT invoices_apartment_id_fk FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS invoices_apartment_id_idx ON invoices(apartment_id);

CREATE TABLE IF NOT EXISTS finances (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL,
    owner_name VARCHAR(100) DEFAULT NULL,
    tenant_name VARCHAR(100) DEFAULT NULL,
    checkin_date DATE DEFAULT NULL,
    checkout_date DATE DEFAULT NULL,
    paid_amount DECIMAL(10,2) NOT NULL,
    expenses DECIMAL(10,2) DEFAULT 0.00,
    expense_description TEXT,
    proof VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency VARCHAR(3) DEFAULT '₺',
    CONSTRAINT fk_finances_apartment FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS fk_finances_apartment_idx ON finances(apartment_id);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    apartment_tag VARCHAR(255) DEFAULT NULL,
    apartment_id INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);