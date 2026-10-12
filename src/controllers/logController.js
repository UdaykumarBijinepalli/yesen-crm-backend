import logService from '../services/logService.js';

export async function addLog(req, res) {
  const { type, message } = req.body;
  const log = await logService.addLog(req.params.id, type, message, req.user?._id);
  res.status(201).json({ log });
}

export async function listLogs(req, res) {
  const logs = await logService.listLogs(req.params.id);
  res.json({ logs });
}
