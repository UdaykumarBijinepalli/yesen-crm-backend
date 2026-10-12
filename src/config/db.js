import mongoose from 'mongoose';
import config from './env.js';
import logger from './logger.js';

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB connection error'));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
