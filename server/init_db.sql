-- create extension for gen_random_uuid if available
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fullname TEXT NOT NULL,
  id_hash TEXT NOT NULL,
  account_hash TEXT NOT NULL,
  account_last4 TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE payments (
  tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES customers(id),
  amount NUMERIC(18,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  provider TEXT,
  payee_account_hash TEXT NOT NULL,
  payee_account_last4 TEXT NOT NULL,
  swift VARCHAR(11) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  verified_by UUID,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Example seed employee (password will be hashed in app or insert hashed string here)
-- INSERT INTO employees (username, password_hash) VALUES ('emp01', '<bcrypt-hash>');
