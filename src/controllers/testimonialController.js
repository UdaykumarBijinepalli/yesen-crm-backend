import testimonialService from '../services/testimonialService.js';
import { serializeTestimonial } from '../utils/testimonialSerializer.js';

export async function listTestimonials(req, res) {
  const { testimonials, pagination } = await testimonialService.listTestimonials(req.query);
  res.json({
    testimonials: testimonials.map(serializeTestimonial),
    pagination,
  });
}

export async function getTestimonial(req, res) {
  const testimonial = await testimonialService.getTestimonial(req.params.id);
  res.json({ testimonial: serializeTestimonial(testimonial) });
}

export async function createTestimonial(req, res) {
  const testimonial = await testimonialService.createTestimonial(req.body, req.user?._id);
  const populated = await testimonialService.getTestimonial(testimonial._id);
  res.status(201).json({ testimonial: serializeTestimonial(populated) });
}

export async function updateTestimonial(req, res) {
  const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body);
  res.json({ testimonial: serializeTestimonial(testimonial) });
}

export async function deleteTestimonial(req, res) {
  await testimonialService.deleteTestimonial(req.params.id);
  res.status(204).send();
}
