import { env } from './env.js';

export const config = {
  env,
  server: {
    port: env.PORT,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
};

export default config; 