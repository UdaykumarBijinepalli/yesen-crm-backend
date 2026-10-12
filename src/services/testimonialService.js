import testimonialRepository from '../repositories/testimonialRepository.js';
import ApiError from '../utils/ApiError.js';
import { buildPaginationMeta, parsePaginationQuery } from '../utils/pagination.js';

async function listTestimonials(query = {}) {
  const { page, limit, skip } = parsePaginationQuery({ ...query, limit: query.limit || 10 });
  const [testimonials, total] = await Promise.all([
    testimonialRepository.findPaginated({ skip, limit }),
    testimonialRepository.countAll(),
  ]);

  return {
    testimonials,
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

async function getTestimonial(id) {
  const testimonial = await testimonialRepository.findById(id);
  if (!testimonial) throw ApiError.notFound('Testimonial not found');
  return testimonial;
}

async function createTestimonial(fields, userId) {
  return testimonialRepository.create({
    name: fields.name ?? '',
    testimonial: fields.testimonial ?? '',
    designation: fields.designation ?? '',
    location: fields.location ?? '',
    createdBy: userId,
  });
}

async function updateTestimonial(id, fields) {
  const testimonial = await testimonialRepository.findById(id);
  if (!testimonial) throw ApiError.notFound('Testimonial not found');

  return testimonialRepository.updateById(id, {
    name: fields.name ?? testimonial.name,
    testimonial: fields.testimonial ?? testimonial.testimonial,
    designation: fields.designation ?? testimonial.designation,
    location: fields.location ?? testimonial.location,
  });
}

async function deleteTestimonial(id) {
  const testimonial = await testimonialRepository.deleteById(id);
  if (!testimonial) throw ApiError.notFound('Testimonial not found');
}

export default {
  listTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
