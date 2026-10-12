import documentService from '../services/documentService.js';

export async function uploadDocument(req, res) {
  const document = await documentService.uploadDocument(
    req.params.id,
    req.file,
    req.body.type,
    req.user?._id
  );
  res.status(201).json({ document });
}

export async function listDocuments(req, res) {
  const documents = await documentService.listDocuments(req.params.id);
  res.json({ documents });
}

export async function downloadDocument(req, res) {
  const { doc, filePath } = await documentService.getDocumentFilePath(req.params.docId);
  res.download(filePath, doc.originalName);
}

export async function deleteDocument(req, res) {
  await documentService.deleteDocument(req.params.docId);
  res.status(204).send();
}
