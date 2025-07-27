#!/usr/bin/env node

const { Client } = require('pg');
const redis = require('redis');

console.log('🔍 Testing Database and Redis Connections...\n');

// Test PostgreSQL
async function testPostgreSQL() {
  const client = new Client({
    host: 'localhost',
    port: 5437,
    user: 'farm_user',
    password: 'farm_pass',
    database: 'farm_db'
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL: Connected successfully!');
    console.log(`   Time from DB: ${res.rows[0].now}`);
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL: Connection failed!');
    console.error(`   Error: ${err.message}`);
    return false;
  }
}

// Test Redis
async function testRedis() {
  const client = redis.createClient({
    socket: {
      host: 'localhost',
      port: 6379
    }
  });

  try {
    await client.connect();
    await client.set('test', 'Daily Farm Manager');
    const value = await client.get('test');
    console.log('✅ Redis: Connected successfully!');
    console.log(`   Test value: ${value}`);
    await client.del('test');
    await client.quit();
    return true;
  } catch (err) {
    console.error('❌ Redis: Connection failed!');
    console.error(`   Error: ${err.message}`);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Testing with credentials from .env file:\n');
  
  const pgSuccess = await testPostgreSQL();
  console.log('');
  const redisSuccess = await testRedis();
  
  console.log('\n' + '='.repeat(50));
  if (pgSuccess && redisSuccess) {
    console.log('✅ All connections successful! Your .env file is configured correctly.');
  } else {
    console.log('⚠️  Some connections failed. Please check your Docker containers:');
    console.log('   Run: docker-compose ps');
    console.log('   Start services: docker-compose up -d postgres redis');
  }
}

// Check if required packages are installed
try {
  require.resolve('pg');
  require.resolve('redis');
} catch (e) {
  console.log('📦 Installing required packages for testing...');
  const { execSync } = require('child_process');
  execSync('npm install pg redis', { stdio: 'inherit' });
}

runTests().catch(console.error);