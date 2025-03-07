import { config } from 'dotenv';

// Load environment variables from .env file
config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
}; 