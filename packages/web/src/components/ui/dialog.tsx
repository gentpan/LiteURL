import type { ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { AlertDialog as BaseAlert } from '@base-ui/react/alert-dialog'
import { X } from 'lucide-react'
import { cn } from '../../shared/cn'
import { Button } from './button'

const BACKDROP = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
const POPUP = 'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] border border-[#27272a] rounded-lg shadow-xl transition-all duration-200 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 focus:outline-none'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={BACKDROP} />
        <BaseDialog.Popup className={cn(POPUP, 'w-full max-w-lg mx-4', className)}>
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
              <BaseDialog.Title className="text-lg font-semibold text-[#fafafa]">{title}</BaseDialog.Title>
              <BaseDialog.Close className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
                <X className="w-5 h-5" />
              </BaseDialog.Close>
            </div>
          )}
          {description && (
            <BaseDialog.Description className="px-5 pt-4 text-sm text-[#a1a1aa]">{description}</BaseDialog.Description>
          )}
          {children}
          {footer && <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#27272a]">{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

interface AlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
}

export function AlertDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, loading, onConfirm }: AlertProps) {
  return (
    <BaseAlert.Root open={open} onOpenChange={onOpenChange}>
      <BaseAlert.Portal>
        <BaseAlert.Backdrop className={BACKDROP} />
        <BaseAlert.Popup className={cn(POPUP, 'w-full max-w-sm mx-4 p-6')}>
          <BaseAlert.Title className="text-lg font-semibold text-[#fafafa] mb-2">{title}</BaseAlert.Title>
          {description && <BaseAlert.Description className="text-sm text-[#a1a1aa] mb-6">{description}</BaseAlert.Description>}
          <div className="flex justify-end gap-3">
            <BaseAlert.Close render={<Button variant="secondary" size="sm" />}>{cancelLabel}</BaseAlert.Close>
            <Button variant={danger ? 'danger' : 'primary'} size="sm" disabled={loading} onClick={onConfirm}>
              {loading ? '...' : confirmLabel}
            </Button>
          </div>
        </BaseAlert.Popup>
      </BaseAlert.Portal>
    </BaseAlert.Root>
  )
}
