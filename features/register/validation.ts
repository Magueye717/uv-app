export const STUDENT_ID_RE = /^P\d{6}$/;
export const PHONE_RE = /^(70|71|75|76|77|78)\d{7}$/;
// Letters (incl. French accents), single spaces or hyphens between words.
const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ -][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

export const PHONE_PREFIX = '+221';

export const normalizeStudentId = (value: string) => value.toUpperCase().replace(/\s/g, '').slice(0, 7);

/** Digits only, max 9 (Senegalese mobile number without the country code). */
export const phoneDigits = (value: string) => value.replace(/\D/g, '').slice(0, 9);

/** "777902880" → "77 790 28 80" */
export const formatPhone = (digits: string) =>
  [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');

export const validateStudentId = (v: string) => (STUDENT_ID_RE.test(v) ? null : 'Format invalide. Exemple : P232055');

export const validatePhone = (v: string) =>
  PHONE_RE.test(v) ? null : 'Numéro invalide. Il doit commencer par 70, 71, 75, 76, 77 ou 78';

export function validateName(value: string, field: 'prénom' | 'nom') {
  const v = value.trim();
  if (!v) return field === 'prénom' ? 'Le prénom est requis' : 'Le nom est requis';
  return NAME_RE.test(v) ? null : 'Utilise uniquement des lettres, des espaces ou des tirets';
}

export const passwordRules = [
  { label: 'Au moins 8 caractères', test: (p: string) => p.length >= 8 },
  { label: 'Au moins 1 chiffre', test: (p: string) => /\d/.test(p) },
];

export const validatePassword = (p: string) =>
  passwordRules.every((r) => r.test(p)) ? null : 'Le mot de passe ne respecte pas les critères';

export const validateConfirm = (password: string, confirm: string) =>
  confirm && confirm === password ? null : 'Les mots de passe ne correspondent pas';

export const CAMPUSES = [
  { key: 'campus1', label: 'Campus 1' },
  { key: 'campus2', label: 'Campus 2' },
] as const;

export type CampusKey = (typeof CAMPUSES)[number]['key'];

// Villages / pavillons per campus. Placeholder names: replace with the official UGB list.
export const VILLAGES: Record<CampusKey, string[]> = {
  campus1: ['Village A', 'Village B', 'Village C', 'Village D', 'Village E', 'Village F'],
  campus2: ['Village G', 'Village H', 'Village I', 'Village J', 'Village K', 'Village L'],
};

/** Room number as written on the door: "214", "C12", "12B". */
export const normalizeRoom = (value: string) => value.toUpperCase().replace(/\s/g, '').slice(0, 6);

export const validateRoom = (v: string) =>
  /^[A-Z]?\d{1,4}[A-Z]?$/.test(v) ? null : v ? 'Format invalide. Exemple : 214 ou C12' : 'Indique ton numéro de chambre';
