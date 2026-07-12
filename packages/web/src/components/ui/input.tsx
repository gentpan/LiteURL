import type { ComponentProps } from 'react'
import { Input as BaseInput } from '@base-ui/react/input'
import { cn } from '../../shared/cn'

const BASE = 'w-full rounded-md bg-[#09090b] border border-[#27272a] text-sm text-[#fafafa] placeholder-[#52525b] outline-none transition-colors focus:border-[#52525b] disabled:opacity-50'

export function Input({ className, ...props }: Omit<ComponentProps<typeof BaseInput>, 'className'> & { className?: string }) {
  return <BaseInput className={cn(BASE, 'h-10 px-3', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(BASE, 'px-3 py-2 font-mono resize-y', className)} {...props} />
}
