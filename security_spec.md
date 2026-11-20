# Security Specification — Tremendo Digital Menu & Admin

## 1. Data Invariants
1. Visitors (unauthenticated) may only read public establishment settings (`/settings/establishment`), active categories (`active == true`), active products (`active == true`), and active promotions (`active == true`).
2. Visitors can never read `/admins/{adminId}` (PII isolation).
3. Only verified administrators (`request.auth.token.email_verified == true` and either bootstrapped owner email `pauletichleandro@gmail.com` or existing `/admins/{uid}` record) can create, update, or delete menu categories, products, promotions, or establishment settings.
4. A Product cannot be created or updated with a non-existent `categoryId` (`exists(/databases/$(database)/documents/categories/$(incoming().categoryId))`).
5. Every string, list, number, and document ID is strictly bounded against denial-of-wallet exhaustion, and every `create`/`update` enforces `hasAll`/`hasOnly` to reject shadow fields.
6. All `updatedAt` / `createdAt` timestamps must match `request.time`.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated write to `/products/p1`
2. Authenticated non-admin write to `/products/p1`
3. Email spoof attack (`email == 'pauletichleandro@gmail.com'` with `email_verified == false`)
4. Shadow field injection (`isAdmin: true` or `extraField: 'hack'`) on `/products/p1`
5. Self-escalation: non-admin creating `/admins/{uid}` with `{ role: 'admin' }`
6. Unauthenticated `list` query on `/admins`
7. Unauthenticated `list` query on `/products` without `where('active', '==', true)` filter
8. Orphaned product creation referencing non-existent `categoryId: 'does-not-exist'`
9. Resource poisoning: document ID longer than 128 chars or containing `/` / invalid chars
10. Negative price or oversized string (>400 chars in `description`) on `/products/p1`
11. Client-forged `updatedAt` timestamp not equal to `request.time`
12. `highlights` array exceeding 10 elements on `/settings/establishment`
