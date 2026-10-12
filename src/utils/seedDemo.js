// Seeds a handful of demo inquiries across product / service / contact forms
// so the Kanban board is usable for local review. Safe to re-run — skips if
// any inquiries already exist.
// Run: pnpm seed:demo:dev
import config from '../config/env.js';
import logger from '../config/logger.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Inquiry from '../models/Inquiry.js';
import intakeService from '../services/intakeService.js';

const DEMO = [
  {
    source: 'product',
    payload: {
      clientName: 'Priya Nair',
      email: 'priya@acmeindustries.in',
      company: 'Acme Industries',
      productOrServiceName: 'Industrial Chiller X200',
      sourcePage: '/products/chiller-x200',
      message: 'Need a quote for two chillers for our Kochi plant.',
      value: 450000,
    },
  },
  {
    source: 'service',
    payload: {
      clientName: 'Rahul Menon',
      phone: '+919876543210',
      company: 'Coastal Foods',
      productOrServiceName: 'AMC Maintenance',
      sourcePage: '/services/amc',
      message: 'Interested in annual maintenance for existing units.',
      value: 85000,
    },
  },
  {
    source: 'contact',
    payload: {
      clientName: 'Ananya Krishnan',
      email: 'ananya@example.com',
      phone: '+919700001111',
      message: 'General inquiry about your product range.',
      sourcePage: '/contact',
    },
  },
  {
    source: 'product',
    payload: {
      clientName: 'Vivek Sharma',
      email: 'vivek@northwind.co',
      company: 'Northwind Logistics',
      productOrServiceName: 'Cold Storage Panel',
      sourcePage: '/products/cold-storage',
      message: 'Looking for panels for a 5000 sqft warehouse.',
      value: 1200000,
    },
  },
];

async function seedDemo() {
  await connectDB();

  const existing = await Inquiry.countDocuments();
  if (existing > 0) {
    logger.info(`Skipping demo seed — ${existing} inquiries already present (env="${config.env}")`);
    await disconnectDB();
    process.exit(0);
  }

  const created = await Promise.all(
    DEMO.map((item) => intakeService.createFromForm(item.source, item.payload))
  );
  created.forEach((inquiry) => {
    logger.info(
      `Demo inquiry created: ${inquiry.clientName} [${inquiry.source}] tags=${inquiry.tags.join(',')}`
    );
  });

  logger.info(`Demo seed complete — ${created.length} inquiries (env="${config.env}")`);
  await disconnectDB();
  process.exit(0);
}

seedDemo().catch((err) => {
  logger.error({ err }, 'Demo seed failed');
  process.exit(1);
});
