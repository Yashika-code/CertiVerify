#!/usr/bin/env node

/**
 * Seed Test Users Script
 * 
 * Usage:
 *   node seed_users.js (from backend folder)
 * 
 * This script quickly creates test accounts:
 * - Students
 * - Verifiers  
 * - Additional Admins
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/user.model.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

// Test users to create
const testUsers = [
  // Additional Admins
  {
    name: 'Raj Kumar',
    email: 'raj@example.com',
    password: 'raj@123',
    role: 'admin',
  },
  {
    name: 'Priya Singh',
    email: 'priya@example.com',
    password: 'priya@123',
    role: 'admin',
  },

  // Verifiers
  {
    name: 'Amit Verifier',
    email: 'amit@example.com',
    password: 'amit@123',
    role: 'verifier',
  },
  {
    name: 'Neha Verifier',
    email: 'neha@example.com',
    password: 'neha@123',
    role: 'verifier',
  },

  // Students
  {
    name: 'Alice Student',
    email: 'alice@example.com',
    password: 'alice@123',
    role: 'student',
  },
  {
    name: 'Bob Student',
    email: 'bob@example.com',
    password: 'bob@123',
    role: 'student',
  },
  {
    name: 'Charlie Student',
    email: 'charlie@example.com',
    password: 'charlie@123',
    role: 'student',
  },
  {
    name: 'Diana Student',
    email: 'diana@example.com',
    password: 'diana@123',
    role: 'student',
  },
];

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function seedUsers() {
  console.clear();
  log('cyan', '╔════════════════════════════════════════════╗');
  log('cyan', '║        Seed Test Users Script              ║');
  log('cyan', '╚════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    log('yellow', '🔗 Connecting to MongoDB...');
    log('blue', `   URI: ${MONGO_URI.substring(0, 60)}...\n`);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    log('green', '✅ Connected to MongoDB\n');

    // Get current database info
    const dbName = mongoose.connection.db.name;
    log('blue', `📦 Database: ${dbName}\n`);

    // Step 1: Create or verify initial admin
    log('yellow', '🔐 Step 1: Setting up initial admin...');
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    try {
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (existingAdmin) {
        log('yellow', `⚠️  Admin already exists: ${adminEmail}`);
      } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await User.create({
          name: 'Initial Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
        });
        log('green', `✅ Created initial admin: ${adminEmail}`);
      }
    } catch (error) {
      log('red', `❌ Error setting up admin: ${error.message}`);
    }

    log('');

    // Step 2: Create each test user
    log('yellow', '📝 Step 2: Creating test users...\n');

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (existingUser) {
          log('yellow', `⚠️  ${user.role.toUpperCase()} ${user.email}: Already exists`);
          skipCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Create user in database
        const createdUser = await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        });

        log('green', `✅ ${user.role.toUpperCase()} created: ${user.email}`);
        successCount++;
      } catch (error) {
        if (error.code === 11000) {
          log('yellow', `⚠️  ${user.role.toUpperCase()} ${user.email}: Already exists (duplicate key)`);
          skipCount++;
        } else {
          log('red', `❌ ${user.role.toUpperCase()} ${user.email}: ${error.message}`);
          failCount++;
        }
      }
    }

    // Summary
    console.log();
    log('cyan', '╔════════════════════════════════════════════╗');
    log('cyan', '║              Results Summary               ║');
    log('cyan', '╚════════════════════════════════════════════╝\n');

    log('green', `✅ Created:  ${successCount} users`);
    if (skipCount > 0) {
      log('yellow', `⚠️  Skipped:  ${skipCount} users (already exist)`);
    }
    if (failCount > 0) {
      log('red', `❌ Failed:   ${failCount} users`);
    }

    // Verify in database
    console.log();
    log('yellow', '✓ Verifying users in database...');
    const totalUsers = await User.countDocuments();
    log('green', `✅ Total users in database: ${totalUsers}\n`);

    // List all users in database
    const allUsers = await User.find({}, 'name email role');
    log('blue', '📋 All Users in Database:\n');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test credentials summary
    console.log();
    log('blue', '📋 Test Account Credentials:\n');

    console.log('FIRST ADMIN (use this to register others):');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}\n`);

    console.log('ADDITIONAL ADMINS:');
    testUsers
      .filter((u) => u.role === 'admin')
      .forEach((user) => {
        console.log(`  ${user.email} / ${user.password}`);
      });

    console.log('\nVERIFIERS:');
    testUsers
      .filter((u) => u.role === 'verifier')
      .forEach((user) => {
        console.log(`  ${user.email} / ${user.password}`);
      });

    console.log('\nSTUDENTS:');
    testUsers
      .filter((u) => u.role === 'student')
      .forEach((user) => {
        console.log(`  ${user.email} / ${user.password}`);
      });

    log('green', '\n✅ Seeding completed!');
    log('cyan', '\nYou can now login to http://localhost:5173 with any of these accounts');

    // Close MongoDB connection
    await mongoose.connection.close();
    log('green', '✅ Database connection closed');
  } catch (error) {
    log('red', `\n❌ Unexpected error: ${error.message}`);
    console.error(error);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
}

// Run
seedUsers();
