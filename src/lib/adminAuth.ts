// src/lib/adminAuth.ts

export const ADMIN_EMAILS = [
  'gazi827@gmail.com',
  'gazi82749@gmail.com',
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
