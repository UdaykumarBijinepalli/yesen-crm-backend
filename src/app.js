import 'express-async-errors';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';

import config from './config/env.js';
import logger from './config/logger.js';
import requestId from './middleware/requestId.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import apiRoutes from './routes/index.js';
import { mountSwagger } from './docs/swagger.js';
import { uploadDir } from './middleware/upload.js';

const app = express();

// Add right before route definitions in src/app.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});







app.disable('x-powered-by');
app.set('trust proxy', 1); // needed for correct req.ip / rate-limiting behind a reverse proxy in uat/prod

app.use(requestId);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    autoLogging: { ignore: (req) => req.url === '/health' },
  })
);

app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow document downloads across origin
    // Swagger UI needs inline scripts/styles; keep other Helmet defaults.
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'validator.swagger.io'],
      },
    },
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $/. operators from user input to prevent NoSQL injection

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'yesen-crm-backend', env: config.env }));

app.use('/uploads', express.static(path.resolve(uploadDir)));

// Interactive API docs (Swagger UI) + raw OpenAPI JSON — outside /api rate limiter
mountSwagger(app);

app.use('/api', apiLimiter);

// Versioned API — this is what new integrations should target.
app.use(`/api/${config.apiVersion}`, apiRoutes);

// Unversioned alias kept for backward compatibility with anything already
// wired against the pre-versioning /api/* paths (e.g. an in-progress
// frontend). Points at the same router as /api/v1 — remove once nothing
// depends on the unversioned path anymore.
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
