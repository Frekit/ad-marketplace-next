"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isDestructive ? (
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
            ) : (
              <Info className="h-6 w-6 text-primary flex-shrink-0" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="mt-2">{description}</DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming || isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            variant={isDestructive ? "destructive" : "default"}
          >
            {isConfirming || isLoading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar más fácilmente
interface UseConfirmationDialogProps {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export function useConfirmationDialog({
  title,
  description,
  confirmText,
  cancelText,
  isDestructive,
}: UseConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const confirm = async (onConfirm: () => void | Promise<void>) => {
    return new Promise<void>((resolve, reject) => {
      setOpen(true)
      const originalOnConfirm = onConfirm

      const wrappedOnConfirm = async () => {
        setIsLoading(true)
        try {
          await originalOnConfirm()
          resolve()
        } catch (error) {
          reject(error)
        } finally {
          setIsLoading(false)
        }
      }

        // Store the callback temporarily
        ; (confirm as any)._onConfirm = wrappedOnConfirm
    })
  }

  return {
    open,
    setOpen,
    isLoading,
    confirm,
    Dialog: (props: Omit<ConfirmationDialogProps, "open" | "onOpenChange" | "isLoading">) => (
      <ConfirmationDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        isLoading={isLoading}
      />
    ),
  }
}
