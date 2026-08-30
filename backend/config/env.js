const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/udyamsetu',
    JWT_SECRET: process.env.JWT_SECRET || 'udyamsetu_ai_super_secret_jwt_key_2026_sih',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // AI LLM API Keys & Model Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
    AI_API_ENDPOINT: process.env.AI_API_ENDPOINT || '',
    
    UPLOAD_DIR: path.join(__dirname, '../../uploads'),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000'
};
