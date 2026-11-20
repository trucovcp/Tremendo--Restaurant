/**
 * Security Rules Verification Suite (Dirty Dozen Adversarial Payloads)
 * Intended for execution against the Firebase Rules Emulator when running security tests.
 */
export const dirtyDozenPayloads = [
  { id: 1, name: 'Unauthenticated product write', path: 'products/p1', auth: null, op: 'create', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Non-admin authenticated product write', path: 'products/p1', auth: { uid: 'visitor-1', email: 'visitor@example.com', email_verified: true }, op: 'create', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Email spoof without email_verified', path: 'products/p1', auth: { uid: 'spoof', email: 'pauletichleandro@gmail.com', email_verified: false }, op: 'create', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Shadow field injection on product', path: 'products/p1', auth: { uid: 'owner', email: 'pauletichleandro@gmail.com', email_verified: true }, op: 'create', payload: { isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Self-escalation on /admins', path: 'admins/visitor-1', auth: { uid: 'visitor-1', email: 'visitor@example.com', email_verified: true }, op: 'create', payload: { role: 'admin' }, expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Unauthenticated list on /admins', path: 'admins', auth: null, op: 'list', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Unauthenticated unfiltered list on /products', path: 'products', auth: null, op: 'list', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Orphaned product with missing categoryId', path: 'products/p1', auth: { uid: 'owner', email: 'pauletichleandro@gmail.com', email_verified: true }, op: 'create', payload: { categoryId: 'nonexistent' }, expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Oversized document ID poisoning', path: `products/${'a'.repeat(130)}`, auth: { uid: 'owner', email: 'pauletichleandro@gmail.com', email_verified: true }, op: 'create', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Negative price & oversized description', path: 'products/p1', auth: { uid: 'owner', email: 'pauletichleandro@gmail.com', email_verified: true }, op: 'create', payload: { price: -10, description: 'x'.repeat(500) }, expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Client-forged updatedAt timestamp', path: 'categories/lomos', auth: { uid: 'owner', email: 'pauletichleandro@gmail.com', email_verified: true }, op: 'create', payload: { updatedAt: '2020-01-01T00:00:00Z' }, expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Highlights array > 10 elements', path: 'settings/establishment', auth: { uid: 'owner', email: 'pauletichleandro@gmail.com', email_verified: true }, op: 'update', payload: { highlights: Array(11).fill('item') }, expected: 'PERMISSION_DENIED' },
];
