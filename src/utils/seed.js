// Creates (or updates) the first admin account so someone can actually log
// into the panel. Run with: pnpm seed:dev | pnpm seed:uat | pnpm seed:prod
// (NODE_ENV picks which .env.* file's SEED_ADMIN_* values get used)
import config from '../config/env.js';
import logger from '../config/logger.js';
import { connectDB, disconnectDB } from '../config/db.js';
import userRepository from '../repositories/userRepository.js';
import User from '../models/User.js';

async function seed() {
  await connectDB();

  const { username, password, name } = config.seedAdmin;
  const passwordHash = await User.hashPassword(password);

  const user = await userRepository.upsertByUsername(username.toLowerCase(), {
    name,
    username: username.toLowerCase(),
    passwordHash,
    role: 'admin',
    permissions: [],
    active: true,
  });

  logger.info(`Admin user ready: username="${user.username}" env="${config.env}"`);
  if (config.isProd) {
    logger.warn('Production seed run — make sure SEED_ADMIN_PASSWORD was a real secret, not a default.');
  }

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
