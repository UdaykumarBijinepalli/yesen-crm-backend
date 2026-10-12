import User from '../models/User.js';

const userRepository = {
  create(data) {
    return User.create(data);
  },

  findById(id) {
    return User.findById(id);
  },

  findByUsername(username) {
    return User.findOne({ username: username.toLowerCase() });
  },

  findActiveByUsername(username) {
    return User.findOne({ username: username.toLowerCase(), active: true });
  },

  findAll() {
    return User.find().sort({ createdAt: -1 });
  },

  findActiveTeam() {
    return User.find({ active: true })
      .select('_id name username role')
      .sort({ name: 1 });
  },

  updateById(id, updates) {
    return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  },

  deleteById(id) {
    return User.findByIdAndDelete(id);
  },

  upsertByUsername(username, data) {
    return User.findOneAndUpdate({ username }, data, { upsert: true, new: true });
  },
};

export default userRepository;
