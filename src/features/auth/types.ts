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
  password?: string
  confirmation: string
}

export interface SetUserRoleInput {
  role: UserRole
}

export interface OAuthInput {
  next: string
}

export interface VendorApplicationInput extends SignUpInput {
  businessName: string
  businessDescription: string
  websiteUrl: string | null
  primaryCategory: string
  logo: File | null
}

export interface UpdateProfileInput {
  fullName?: string | null
  avatarUrl?: string | null
}
