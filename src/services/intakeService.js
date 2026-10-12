import inquiryRepository from '../repositories/inquiryRepository.js';
import interactionLogRepository from '../repositories/interactionLogRepository.js';
import { buildAutoTags } from '../utils/autoTag.js';

async function createFromForm(source, payload) {
  const {
    clientName,
    name,
    email,
    phone,
    company,
    message,
    productOrServiceName,
    sourcePage,
    value,
    vesselType,
    retrofitStatus,
    vesselLength,
    operatingArea,
    dailyOperatingHours,
    timeLine,
  } = payload;

  const resolvedName = clientName || name;
  const tags = buildAutoTags({ source, productOrServiceName });

  const inquiry = await inquiryRepository.create({
    clientName: resolvedName,
    email,
    phone,
    company,
    message,
    source,
    sourcePage,
    productOrServiceName,
    value: value ?? null,
    // Additional vessel fields from website forms (optional)
    vesselType: vesselType || null,
    retrofitStatus: retrofitStatus || null,
    vesselLength: vesselLength || null,
    operatingArea: operatingArea || null,
    dailyOperatingHours: dailyOperatingHours || null,
    timeLine: timeLine || null,
    tags,
    stage: 'Inquired',
  });

  await interactionLogRepository.create({
    inquiry: inquiry._id,
    type: 'system',
    message: `Inquiry received via ${source} page${sourcePage ? ` (${sourcePage})` : ''}.`,
  });

  return inquiry;
}

export default { createFromForm };
