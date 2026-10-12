import inquiryService from '../services/inquiryService.js';

export async function listInquiries(req, res) {
  const { board } = req.query;

  if (board === 'true' || board === '1') {
    const columns = await inquiryService.getBoard(req.query);
    return res.json({ columns });
  }

  const inquiries = await inquiryService.listInquiries(req.query);
  return res.json({ inquiries });
}

export async function getInquiry(req, res) {
  const { inquiry, logs, documents } = await inquiryService.getInquiryDetail(req.params.id);

  const inquiryObj = inquiry.toObject();
  const {
    vesselType,
    retrofitStatus,
    vesselLength,
    operatingArea,
    dailyOperatingHours,
    timeLine,
  } = inquiryObj;

  res.json({
    inquiry: {
      ...inquiryObj,
      vesselType: vesselType ?? null,
      retrofitStatus: retrofitStatus ?? null,
      vesselLength: vesselLength ?? null,
      operatingArea: operatingArea ?? null,
      dailyOperatingHours: dailyOperatingHours ?? null,
      timeLine: timeLine ?? null,
    },
    logs,
    documents,
  });
}

export async function updateInquiry(req, res) {
  const inquiry = await inquiryService.updateInquiry(req.params.id, req.body);
  res.json({ inquiry });
}

export async function moveStage(req, res) {
  const { stage, lostReason } = req.body;
  const inquiry = await inquiryService.moveStage(req.params.id, stage, lostReason, req.user?._id);
  res.json({ inquiry });
}

export async function addTag(req, res) {
  const inquiry = await inquiryService.addTag(req.params.id, req.body.tag);
  res.json({ inquiry });
}

export async function removeTag(req, res) {
  const inquiry = await inquiryService.removeTag(req.params.id, req.params.tag);
  res.json({ inquiry });
}

export async function setQuotationStatus(req, res) {
  const inquiry = await inquiryService.setQuotationStatus(req.params.id, req.body.sent, req.user?._id);
  res.json({ inquiry });
}

export async function deleteInquiry(req, res) {
  await inquiryService.deleteInquiry(req.params.id);
  res.status(204).send();
}
