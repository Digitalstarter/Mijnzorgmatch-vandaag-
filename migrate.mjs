import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function migrate() {
  console.log('🔄 Creating database tables...');
  
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);
      
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR,
        credits INTEGER NOT NULL DEFAULT 0,
        stripe_customer_id VARCHAR,
        stripe_subscription_id VARCHAR,
        subscription_status VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS zzp_profiles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR NOT NULL,
        bio TEXT NOT NULL,
        expertise TEXT[] NOT NULL,
        location VARCHAR NOT NULL,
        availability VARCHAR NOT NULL,
        hourly_rate VARCHAR,
        experience TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS vacancies (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organisation_name VARCHAR NOT NULL,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT[] NOT NULL,
        location VARCHAR NOT NULL,
        contract_type VARCHAR NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        applicant_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR NOT NULL,
        target_id VARCHAR NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        sender_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        credits INTEGER,
        stripe_payment_intent_id VARCHAR,
        description TEXT NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
