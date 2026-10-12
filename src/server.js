import config from './config/env.js'; // must load first: validates & sets up process.env for everything else
import logger from './config/logger.js';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

async function start() {
  await connectDB();

  server = app.listen(config.port, () => {
    logger.info(`Yesen CRM backend listening on port ${config.port} [env=${config.env}]`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
  await disconnectDB();
  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception — exiting');
  process.exit(1);
});

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
