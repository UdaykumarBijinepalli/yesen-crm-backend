export function serializeTestimonial(testimonial) {
  if (!testimonial) return null;
  const doc = testimonial.toObject ? testimonial.toObject() : { ...testimonial };
  const addedBy = doc.createdBy
    ? {
        _id: doc.createdBy._id,
        name: doc.createdBy.name,
        username: doc.createdBy.username,
      }
    : null;

  return {
    _id: doc._id,
    name: doc.name,
    testimonial: doc.testimonial,
    designation: doc.designation,
    location: doc.location,
    createdBy: addedBy,
    addedBy: addedBy?.name || addedBy?.username || '—',
    addedAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
