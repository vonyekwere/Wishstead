export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_admin'

export interface LoginInput {
  email: string
  password: string
  captchaToken?: string
}

export interface SignUpInput extends LoginInput {
  fullName: string
}

export interface ForgotPasswordInput {
  email: string
  captchaToken?: string
}

export interface ResetPasswordInput {
  password: string
}

export interface ChangePasswordInput extends ResetPasswordInput {
  currentPassword: string
}

export interface ChangeEmailInput {
  email: string
}

export interface DeleteAccountInput {
  password: string
}

export interface SetUserRoleInput {
  role: UserRole
}

export interface UpdateProfileInput {
  fullName?: string | null
  avatarUrl?: string | null
}
