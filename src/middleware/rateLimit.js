import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Public form endpoints are unauthenticated and internet-facing, so they
// get a tighter limit to blunt basic spam/abuse.
export const formsLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.formsMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions, please try again later.' },
});

// Login is the one endpoint worth protecting from credential-stuffing /
// brute-force separately from general API traffic: a much lower ceiling,
// and successful logins don't count against the limit so a legitimate
// user who mistypes a couple of times isn't locked out alongside an
// actual attacker.
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again later.' },
});
