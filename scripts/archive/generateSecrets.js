#!/usr/bin/env node

// scripts/generateSecrets.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate cryptographically secure random strings for JWT secrets
 */
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key
 */
function generateApiKey(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate NextAuth secret
 */
function generateNextAuthSecret() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Create or update .env file with secure secrets
 */
function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Read existing .env file if it exists
  let existingEnv = {};
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        existingEnv[key.trim()] = values.join('=').trim();
      }
    });
  }

  // Generate new secrets
  const secrets = {
    JWT_SECRET: generateSecureSecret(64),
    REFRESH_SECRET: generateSecureSecret(64),
    API_KEY: generateApiKey(32),
    COOKIE_SECRET: generateSecureSecret(32),
    NEXTAUTH_SECRET: generateNextAuthSecret(),
  };

  // Preserve existing values or use new secrets
  const envVars = {
    // Database
    MONGODB_URI: existingEnv.MONGODB_URI || 'mongodb://localhost:27017/mesrit',
    
    // Authentication & Security
    JWT_SECRET: existingEnv.JWT_SECRET || secrets.JWT_SECRET,
    REFRESH_SECRET: existingEnv.REFRESH_SECRET || secrets.REFRESH_SECRET,
    API_KEY: existingEnv.API_KEY || secrets.API_KEY,
    COOKIE_SECRET: existingEnv.COOKIE_SECRET || secrets.COOKIE_SECRET,
    NEXTAUTH_URL: existingEnv.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: existingEnv.NEXTAUTH_SECRET || secrets.NEXTAUTH_SECRET,
    
    // CORS
    ALLOWED_ORIGINS: existingEnv.ALLOWED_ORIGINS || 'http://localhost:3000',
    
    // Email Configuration
    SMTP_HOST: existingEnv.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: existingEnv.SMTP_PORT || '587',
    SMTP_SECURE: existingEnv.SMTP_SECURE || 'false',
    SMTP_USER: existingEnv.SMTP_USER || 'your_email@gmail.com',
    SMTP_PASS: existingEnv.SMTP_PASS || 'your_app_specific_password',
    FROM_EMAIL: existingEnv.FROM_EMAIL || 'noreply@mesrit.gov',
    ADMIN_EMAIL: existingEnv.ADMIN_EMAIL || 'admin@mesrit.gov',
    
    // Application Configuration
    NODE_ENV: existingEnv.NODE_ENV || 'development',
    FRONTEND_URL: existingEnv.FRONTEND_URL || 'http://localhost:3000',
    BACKEND_URL: existingEnv.BACKEND_URL || 'http://localhost:3000/api',
    
    // File Upload
    MAX_FILE_SIZE: existingEnv.MAX_FILE_SIZE || '10485760',
    UPLOAD_DIR: existingEnv.UPLOAD_DIR || './public/uploads',
    TEMP_UPLOAD_DIR: existingEnv.TEMP_UPLOAD_DIR || './temp',
    ALLOWED_IMAGE_TYPES: existingEnv.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif',
    ALLOWED_DOCUMENT_TYPES: existingEnv.ALLOWED_DOCUMENT_TYPES || 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // External Services
    GOOGLE_MAPS_API_KEY: existingEnv.GOOGLE_MAPS_API_KEY || 'your_google_maps_api_key',
    GOOGLE_ANALYTICS_ID: existingEnv.GOOGLE_ANALYTICS_ID || 'GA-XXXXXXXXX',
    
    // Cache & Performance
    REDIS_URL: existingEnv.REDIS_URL || 'redis://localhost:6379',
    REDIS_PASSWORD: existingEnv.REDIS_PASSWORD || '',
    CACHE_TTL: existingEnv.CACHE_TTL || '300',
    
    // Logging & Monitoring
    LOG_LEVEL: existingEnv.LOG_LEVEL || 'info',
    SENTRY_DSN: existingEnv.SENTRY_DSN || '',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: existingEnv.RATE_LIMIT_WINDOW_MS || '900000',
    RATE_LIMIT_MAX_REQUESTS: existingEnv.RATE_LIMIT_MAX_REQUESTS || '100',
    
    // Development
    DEBUG_API: existingEnv.DEBUG_API || 'false',
    DEBUG_AUTH: existingEnv.DEBUG_AUTH || 'false',
    SEED_DATABASE: existingEnv.SEED_DATABASE || 'false',
  };

  // Create .env file content
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write .env file
  fs.writeFileSync(envPath, envContent + '\n');

  // Create backup with timestamp if secrets were generated
  const hasNewSecrets = !existingEnv.JWT_SECRET || !existingEnv.REFRESH_SECRET || !existingEnv.API_KEY || !existingEnv.COOKIE_SECRET;
  if (hasNewSecrets) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), `.env.backup.${timestamp}`);
    
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, backupPath);
      console.log(`🔄 Backup created: ${backupPath}`);
    }
  }

  return { envVars, secrets, hasNewSecrets };
}

/**
 * Validate generated secrets
 */
function validateSecrets(secrets) {
  const validations = [];

  // Check JWT_SECRET strength
  if (secrets.JWT_SECRET.length < 64) {
    validations.push('❌ JWT_SECRET should be at least 64 characters');
  } else {
    validations.push('✅ JWT_SECRET length is sufficient');
  }

  // Check REFRESH_SECRET strength
  if (secrets.REFRESH_SECRET.length < 64) {
    validations.push('❌ REFRESH_SECRET should be at least 64 characters');
  } else {
    validations.push('✅ REFRESH_SECRET length is sufficient');
  }

  // Check API_KEY strength
  if (secrets.API_KEY.length < 32) {
    validations.push('❌ API_KEY should be at least 32 characters');
  } else {
    validations.push('✅ API_KEY length is sufficient');
  }

  // Check uniqueness
  const uniqueSecrets = new Set([secrets.JWT_SECRET, secrets.REFRESH_SECRET, secrets.API_KEY]);
  if (uniqueSecrets.size === 3) {
    validations.push('✅ All secrets are unique');
  } else {
    validations.push('❌ Secrets should be unique');
  }

  return validations;
}

/**
 * Main function
 */
function main() {
  console.log('🔐 MESRIT Security Secrets Generator');
  console.log('====================================\n');

  try {
    const { envVars, secrets, hasNewSecrets } = updateEnvFile();

    if (hasNewSecrets) {
      console.log('🔑 Generated new secrets:');
      console.log('- JWT_SECRET: ✓ Generated');
      console.log('- REFRESH_SECRET: ✓ Generated');
      console.log('- API_KEY: ✓ Generated');
      console.log('- NEXTAUTH_SECRET: ✓ Generated\n');

      // Validate secrets
      const validations = validateSecrets(secrets);
      console.log('🔍 Secret validation:');
      validations.forEach(validation => console.log(`  ${validation}`));
      console.log();
    } else {
      console.log('✅ Using existing secrets from .env file\n');
    }

    console.log('📝 Environment file updated: .env');
    console.log('📋 Total environment variables:', Object.keys(envVars).length);

    if (hasNewSecrets) {
      console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
      console.log('1. Keep your .env file secure and never commit it to version control');
      console.log('2. Use different secrets for production, staging, and development');
      console.log('3. Rotate secrets regularly (every 90 days recommended)');
      console.log('4. Store production secrets in secure environment variable systems');
      console.log('5. The backup file contains your old secrets - delete it after verifying the new setup\n');
    }

    console.log('✅ Secrets generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating secrets:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureSecret,
  generateApiKey,
  generateNextAuthSecret,
  updateEnvFile,
  validateSecrets
};