export function serializeProject(project) {
  if (!project) return null;
  const doc = project.toObject ? project.toObject() : { ...project };
  const imageUrl = doc.image?.storedFilename
    ? `/uploads/projects/${doc.image.storedFilename}`
    : null;
  return {
    _id: doc._id,
    name: doc.name,
    description: doc.description,
    location: doc.location,
    type: doc.type,
    deployed: doc.deployed,
    technology: doc.technology,
    status: doc.status || 'ongoing',
    image: doc.image,
    imageUrl,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
