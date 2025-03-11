// Use native Node.js environment variables support
// No need for dotenv as we're using the --env-file flag in the dev script

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
}; 