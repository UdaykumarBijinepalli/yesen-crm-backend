import fs from 'fs/promises';
import path from 'path';
import projectRepository from '../repositories/projectRepository.js';
import ApiError from '../utils/ApiError.js';
import { PROJECT_STATUSES } from '../models/Project.js';
import { buildPaginationMeta, parsePaginationQuery } from '../utils/pagination.js';
import { projectUploadDir } from '../middleware/projectUpload.js';

function parseStatusFilter(query) {
  const status = query?.status;
  if (!status) return undefined;
  if (!PROJECT_STATUSES.includes(status)) {
    throw ApiError.badRequest('Invalid status filter');
  }
  return status;
}

function buildImageMeta(file) {
  if (!file) return undefined;
  return {
    originalName: file.originalname,
    storedFilename: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  };
}

async function removeImageFile(storedFilename) {
  if (!storedFilename) return;
  const filePath = path.join(projectUploadDir, storedFilename);
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing files
  }
}

async function listProjects(query = {}) {
  const { page, limit, skip } = parsePaginationQuery(query);
  const status = parseStatusFilter(query);
  const [projects, total] = await Promise.all([
    projectRepository.findPaginated({ skip, limit, status }),
    projectRepository.countAll(status),
  ]);

  return {
    projects,
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

async function getProject(id) {
  const project = await projectRepository.findById(id);
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

async function createProject(fields, file, userId) {
  const status = fields.status && PROJECT_STATUSES.includes(fields.status) ? fields.status : 'ongoing';
  return projectRepository.create({
    name: fields.name ?? '',
    description: fields.description ?? '',
    location: fields.location ?? '',
    type: fields.type ?? '',
    deployed: fields.deployed ?? '',
    technology: fields.technology ?? '',
    status,
    image: buildImageMeta(file),
    createdBy: userId,
  });
}

async function updateProject(id, fields, file) {
  const project = await projectRepository.findById(id);
  if (!project) throw ApiError.notFound('Project not found');

  const updates = {
    name: fields.name ?? project.name,
    description: fields.description ?? project.description,
    location: fields.location ?? project.location,
    type: fields.type ?? project.type,
    deployed: fields.deployed ?? project.deployed,
    technology: fields.technology ?? project.technology,
  };

  if (fields.status && PROJECT_STATUSES.includes(fields.status)) {
    updates.status = fields.status;
  }

  if (file) {
    await removeImageFile(project.image?.storedFilename);
    updates.image = buildImageMeta(file);
  }

  return projectRepository.updateById(id, updates);
}

async function deleteProject(id) {
  const project = await projectRepository.findById(id);
  if (!project) throw ApiError.notFound('Project not found');
  await removeImageFile(project.image?.storedFilename);
  await projectRepository.deleteById(id);
}

export default {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
