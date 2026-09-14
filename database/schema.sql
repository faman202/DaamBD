-- ==========================================================
-- DaamBD - PostgreSQL DDL Schema
-- Production-Ready Market Price Intelligence Platform
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM Types
DO $$ BEGIN
    CREATE TYPE price_type_enum AS ENUM ('retail', 'wholesale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE anomaly_status_enum AS ENUM ('normal', 'warning', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trust_level_enum AS ENUM ('official_gov', 'verified_field', 'crowdsourced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name_bn VARCHAR(128) NOT NULL,
    name_en VARCHAR(128) NOT NULL,
    display_order INT DEFAULT 0,
    icon VARCHAR(64) DEFAULT 'package',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(128) UNIQUE NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    default_unit VARCHAR(32) DEFAULT 'kg',
    is_convertible_by_weight BOOLEAN DEFAULT TRUE,
    moa_commodity_id INT UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_bn ON products(name_bn);
CREATE INDEX IF NOT EXISTS idx_products_name_en ON products(name_en);
CREATE INDEX IF NOT EXISTS idx_products_moa_id ON products(moa_commodity_id);

-- 5. Locations Table (Divisions, Districts, Upazilas)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_bn VARCHAR(64) NOT NULL,
    division_en VARCHAR(64) NOT NULL,
    district_bn VARCHAR(64) NOT NULL,
    district_en VARCHAR(64) NOT NULL,
    upazila_bn VARCHAR(64),
    upazila_en VARCHAR(64),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_district_en ON locations(district_en);
CREATE INDEX IF NOT EXISTS idx_locations_division_en ON locations(division_en);

-- 6. Markets Table
CREATE TABLE IF NOT EXISTS markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name_bn VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    market_code VARCHAR(64) UNIQUE NOT NULL,
    market_type VARCHAR(64) DEFAULT 'retail_wholesale',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_markets_location ON markets(location_id);
CREATE INDEX IF NOT EXISTS idx_markets_code ON markets(market_code);

-- 7. Price Sources Table (Attribution & Verification Trust)
CREATE TABLE IF NOT EXISTS price_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    source_url TEXT,
    trust_level trust_level_enum DEFAULT 'official_gov',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Daily Prices Table
CREATE TABLE IF NOT EXISTS prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES price_sources(id) ON DELETE CASCADE,
    price_type price_type_enum DEFAULT 'retail',
    unit VARCHAR(32) DEFAULT 'kg',
    min_price DECIMAL(10, 2) NOT NULL CHECK (min_price >= 0),
    max_price DECIMAL(10, 2) NOT NULL CHECK (max_price >= min_price),
    avg_price DECIMAL(10, 2) NOT NULL CHECK (avg_price >= min_price AND avg_price <= max_price),
    currency VARCHAR(8) DEFAULT 'BDT',
    anomaly_status anomaly_status_enum DEFAULT 'normal',
    effective_date DATE NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_market_type_date UNIQUE (product_id, market_id, price_type, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_prices_effective_date ON prices(effective_date);
CREATE INDEX IF NOT EXISTS idx_prices_product_date ON prices(product_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_prices_market_date ON prices(market_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_prices_anomaly ON prices(anomaly_status);

-- 9. Historical Prices Table (Time Series)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES price_sources(id) ON DELETE CASCADE,
    unit VARCHAR(32) DEFAULT 'kg',
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    avg_price DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_history_lookup ON price_history(product_id, market_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(effective_date);
