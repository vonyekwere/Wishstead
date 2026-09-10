export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const passwordRules = [
  { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (value: string) => value.length >= PASSWORD_MIN_LENGTH },
  { id: 'uppercase', label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { id: 'number', label: 'One number', test: (value: string) => /\d/.test(value) },
  { id: 'symbol', label: 'One special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const

export function isStrongPassword(value: string) {
  return value.length <= PASSWORD_MAX_LENGTH && passwordRules.every((rule) => rule.test(value))
}
