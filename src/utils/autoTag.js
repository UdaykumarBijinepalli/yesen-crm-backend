// Per MOM point 4:
// - Product/Service page inquiries get tagged with the product/service name.
// - General Contact page inquiries get tagged "Open" (staff can add specific
//   tags manually afterwards).
export function buildAutoTags({ source, productOrServiceName }) {
  const tags = new Set();

  if (source === 'contact') {
    tags.add('Open');
  } else if ((source === 'product' || source === 'service') && productOrServiceName) {
    tags.add(productOrServiceName.trim());
  } else {
    // Fallback safety net — should not normally happen if forms send
    // productOrServiceName correctly, but avoid leaving an inquiry untagged.
    tags.add('Open');
  }

  return Array.from(tags);
}
