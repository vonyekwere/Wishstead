import { Check, Circle } from 'lucide-react'
import { passwordRules } from '@/features/auth/password-policy'

export default function PasswordRequirements({ password, confirmation }: { password: string; confirmation?: string }) {
  const rules = confirmation === undefined
    ? passwordRules
    : [...passwordRules, { id: 'match', label: 'Passwords match', test: () => Boolean(confirmation) && password === confirmation }]

  return (
    <div className="mt-3" aria-live="polite">
      <p className="text-xs font-medium text-[#5C5548]">Your password must contain:</p>
      <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {rules.map((rule) => {
          const met = rule.test(password)
          const Icon = met ? Check : Circle
          return (
            <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-700' : 'text-neutral-500'}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={met ? 2.5 : 1.5} aria-hidden="true" />
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
