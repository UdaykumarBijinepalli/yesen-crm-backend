import path from 'path';
import fs from 'fs';
import pino from 'pino';
import config from './env.js';

const targets = [];

// Console: pretty/colorized in development for readability, raw JSON lines
// everywhere else so log aggregators (CloudWatch, Loki, etc.) can parse them.
targets.push(
  config.isDev
    ? {
        target: 'pino-pretty',
        level: config.logLevel,
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      }
    : { target: 'pino/file', level: config.logLevel, options: { destination: 1 } } // fd 1 = stdout
);

// File: rotates daily (new dated file each day) and by size, keeping a
// bounded number of files — this is the "log versioning" piece, so a
// single log file never grows forever and old days roll off automatically.
if (config.logToFile) {
  const logDir = path.resolve(process.cwd(), config.logDir);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  targets.push({
    target: 'pino-roll',
    level: config.logLevel,
    options: {
      file: path.join(logDir, 'app'),
      extension: '.log',
      frequency: 'daily',
      size: '20m',
      mkdir: true,
      limit: { count: config.logRetentionDays },
    },
  });
}

const logger = pino({
  level: config.logLevel,
  base: { service: 'yesen-crm-backend', env: config.env },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: { targets },
});

export default logger;
