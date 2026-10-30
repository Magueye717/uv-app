// Mock auth API. Replace each function's body with a real HTTP call; the screens only depend
// on these signatures. Delays simulate network latency.

export const OTP_LENGTH = 4;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_DELAY_S = 60;

/** Code accepted by the mock. Shown on screen in development builds only. */
export const DEV_OTP = '1234';

export type OtpChannel = 'sms' | 'whatsapp' | 'email';

export type User = {
  id: string;
  studentId: string;
  phone: string;
  firstName: string;
  lastName: string;
  campus: string;
  village: string;
};

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; attemptsLeft: number }
  | { ok: false; reason: 'expired' | 'locked' };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Seed data: an existing account to test "Ce compte existe déjà", and a student with a linked e-mail.
const accounts: { studentId: string; phone: string }[] = [{ studentId: 'P210001', phone: '771234567' }];
const linkedEmails: Record<string, string> = { P232055: 'awa.diop@ugb.edu.sn' };

let pendingOtp: { phone: string; code: string; expiresAt: number; attempts: number } | null = null;

export async function accountExists(studentId: string, phone: string): Promise<boolean> {
  await wait(700);
  return accounts.some((a) => a.studentId === studentId || a.phone === phone);
}

/** E-mail linked to the student ID in the university directory, if any. */
export async function getLinkedEmail(studentId: string): Promise<string | null> {
  await wait(200);
  return linkedEmails[studentId] ?? null;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}•••${user.slice(-1)}@${domain}`;
}

export async function sendOtp(phone: string, _channel: OtpChannel): Promise<void> {
  await wait(800);
  pendingOtp = { phone, code: DEV_OTP, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 };
}

export async function verifyOtp(code: string): Promise<VerifyResult> {
  await wait(600);
  if (!pendingOtp || Date.now() > pendingOtp.expiresAt) return { ok: false, reason: 'expired' };
  if (pendingOtp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: 'locked' };
  if (code === pendingOtp.code) {
    pendingOtp = null;
    return { ok: true };
  }
  pendingOtp.attempts += 1;
  const attemptsLeft = OTP_MAX_ATTEMPTS - pendingOtp.attempts;
  return attemptsLeft > 0 ? { ok: false, reason: 'invalid', attemptsLeft } : { ok: false, reason: 'locked' };
}

export async function createAccount(input: Omit<User, 'id'> & { password: string }): Promise<User> {
  await wait(900);
  const { password: _password, ...profile } = input;
  accounts.push({ studentId: profile.studentId, phone: profile.phone });
  return { id: `u_${Date.now()}`, ...profile };
}
