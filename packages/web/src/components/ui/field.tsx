import type { ReactNode } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cn } from '../../shared/cn'

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  className?: string
  children: ReactNode
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <BaseField.Root className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <BaseField.Label className="text-sm text-[#a1a1aa]">
          {label}
        </BaseField.Label>
      )}
      {children}
      {hint && <BaseField.Description className="text-xs text-[#52525b]">{hint}</BaseField.Description>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </BaseField.Root>
  )
}
