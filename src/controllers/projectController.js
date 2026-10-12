import projectService from '../services/projectService.js';
import { serializeProject } from '../utils/projectSerializer.js';

export async function listProjects(req, res) {
  const { projects, pagination } = await projectService.listProjects(req.query);
  res.json({
    projects: projects.map(serializeProject),
    pagination,
  });
}

export async function getProject(req, res) {
  const project = await projectService.getProject(req.params.id);
  res.json({ project: serializeProject(project) });
}

export async function createProject(req, res) {
  const project = await projectService.createProject(req.body, req.file, req.user?._id);
  res.status(201).json({ project: serializeProject(project) });
}

export async function updateProject(req, res) {
  const project = await projectService.updateProject(req.params.id, req.body, req.file);
  res.json({ project: serializeProject(project) });
}

export async function deleteProject(req, res) {
  await projectService.deleteProject(req.params.id);
  res.status(204).send();
}
