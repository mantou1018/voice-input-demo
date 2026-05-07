export function normalizePhoneInput(input: string) {
  return input.replace(/\D/gu, '').slice(0, 11);
}

export function isCompletePhoneNumber(input: string) {
  return /^1\d{10}$/u.test(input);
}
