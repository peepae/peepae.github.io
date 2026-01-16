'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastNotificationProps {
  toasts: Toast[]
  onRemove: (id: number) => void
}

export default function ToastNotification({ toasts, onRemove }: ToastNotificationProps) {
  useEffect(() => {
    const timers = toasts.map(toast => 
      setTimeout(() => onRemove(toast.id), 3000)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, onRemove])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />
      case 'error': return <AlertCircle size={20} />
      case 'info': return <Info size={20} />
    }
  }

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-500 dark:bg-green-600'
      case 'error': return 'bg-red-500 dark:bg-red-600'
      case 'info': return 'bg-blue-500 dark:bg-blue-600'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getColors(toast.type)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in-right transition-all`}
        >
          {getIcon(toast.type)}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="hover:bg-white/20 rounded p-1 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, showToast, removeToast }
}
