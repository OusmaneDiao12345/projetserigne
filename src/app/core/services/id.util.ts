export function createId(prefix = 'grf'): string {
  const random = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`;
}

export function createReference(kind: string): string {
  const year = new Date().getFullYear();
  const stamp = Math.floor(Math.random() * 9000 + 1000);
  return `${kind}-${year}-${stamp}`;
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`grf::${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}
