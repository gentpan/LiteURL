import type { ComponentProps } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { cn } from '../../shared/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#fafafa] text-[#18181b] hover:bg-[#e4e4e7]',
  secondary: 'border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]',
  ghost: 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-8 w-8',
}

export interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, 'className'> {
  variant?: Variant
  size?: Size
  className?: string
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52525b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
