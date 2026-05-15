-- Users
CREATE TABLE t_p12452184_digital_products_mar.users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  balance     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE t_p12452184_digital_products_mar.products (
  id          SERIAL PRIMARY KEY,
  seller_id   INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.users(id),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  price       INTEGER NOT NULL,
  file_url    TEXT,
  preview_url TEXT,
  file_name   TEXT,
  file_format TEXT,
  rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
  sales_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases
CREATE TABLE t_p12452184_digital_products_mar.purchases (
  id          SERIAL PRIMARY KEY,
  buyer_id    INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.users(id),
  product_id  INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.products(id),
  amount      INTEGER NOT NULL,
  payment_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);

-- Reviews
CREATE TABLE t_p12452184_digital_products_mar.reviews (
  id          SERIAL PRIMARY KEY,
  buyer_id    INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.users(id),
  product_id  INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.products(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);

-- Withdrawals
CREATE TABLE t_p12452184_digital_products_mar.withdrawals (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.users(id),
  amount      INTEGER NOT NULL,
  commission  INTEGER NOT NULL,
  card_last4  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (YooKassa)
CREATE TABLE t_p12452184_digital_products_mar.payments (
  id              SERIAL PRIMARY KEY,
  payment_id      TEXT NOT NULL UNIQUE,
  buyer_id        INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.users(id),
  product_id      INTEGER NOT NULL REFERENCES t_p12452184_digital_products_mar.products(id),
  amount          INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  confirmation_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
