import { Select as BaseSelect } from '@base-ui/react/select'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../shared/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  className?: string
  placeholder?: string
}

export function Select({ value, onValueChange, options, className, placeholder }: SelectProps) {
  return (
    <BaseSelect.Root value={value} onValueChange={v => onValueChange(v ?? '')} items={options}>
      <BaseSelect.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2 h-10 px-3 rounded-md bg-[#09090b] border border-[#27272a] text-sm text-[#fafafa] outline-none transition-colors hover:border-[#3f3f46] focus-visible:border-[#52525b] data-[popup-open]:border-[#52525b]',
          className,
        )}
      >
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon className="text-[#52525b]">
          <ChevronsUpDown className="w-4 h-4" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} className="z-50">
          <BaseSelect.Popup className="min-w-[var(--anchor-width)] rounded-md bg-[#0a0a0a] border border-[#27272a] p-1 shadow-xl outline-none transition-all duration-150 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0">
            {options.map(o => (
              <BaseSelect.Item
                key={o.value}
                value={o.value}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm text-[#a1a1aa] cursor-default outline-none select-none data-[highlighted]:bg-[#18181b] data-[highlighted]:text-[#fafafa] data-[selected]:text-[#fafafa]"
              >
                <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                <BaseSelect.ItemIndicator>
                  <Check className="w-4 h-4" />
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}
