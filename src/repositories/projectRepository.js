import Project from '../models/Project.js';

const projectRepository = {
  create(data) {
    return Project.create(data);
  },

  findById(id) {
    return Project.findById(id);
  },

  findAll() {
    return Project.find().sort({ createdAt: -1 });
  },

  findPaginated({ skip, limit, status }) {
    const filter = status ? { status } : {};
    return Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  countAll(status) {
    const filter = status ? { status } : {};
    return Project.countDocuments(filter);
  },

  updateById(id, updates) {
    return Project.findByIdAndUpdate(id, updates, { new: true });
  },

  deleteById(id) {
    return Project.findByIdAndDelete(id);
  },
};

export default projectRepository;
