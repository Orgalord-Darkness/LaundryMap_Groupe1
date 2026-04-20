import { useEffect, useState } from "react"
import { CheckCircle2, Info, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface RedirectDialogProps {
  open: boolean
  title: string
  message: string
  destinationLabel: string
  variant?: "success" | "info" | "error"
  duration?: number
  onNavigate: () => void
}

const variantConfig = {
  success: {
    Icon: CheckCircle2,
    iconClass: "text-green-600",
    headerClass: "bg-green-50",
    titleClass: "text-green-800",
    barClass: "bg-green-500",
  },
  info: {
    Icon: Info,
    iconClass: "text-[#0077B6]",
    headerClass: "bg-blue-50",
    titleClass: "text-[#0077B6]",
    barClass: "bg-[#0077B6]",
  },
  error: {
    Icon: AlertTriangle,
    iconClass: "text-red-600",
    headerClass: "bg-red-50",
    titleClass: "text-red-800",
    barClass: "bg-red-500",
  },
}

export function RedirectDialog({
  open,
  title,
  message,
  destinationLabel,
  variant = "success",
  duration = 2000,
  onNavigate,
}: RedirectDialogProps) {
  const [progress, setProgress] = useState(100)
  const [seconds, setSeconds] = useState(Math.ceil(duration / 1000))
  const { Icon, iconClass, headerClass, titleClass, barClass } = variantConfig[variant]

  useEffect(() => {
    if (!open) {
      setProgress(100)
      setSeconds(Math.ceil(duration / 1000))
      return
    }

    const startTimeout = setTimeout(() => setProgress(0), 50)
    const navTimeout = setTimeout(onNavigate, duration)
    const interval = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      clearTimeout(startTimeout)
      clearTimeout(navTimeout)
      clearInterval(interval)
    }
  }, [open])

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0 gap-0 max-w-sm">
        <div className={`${headerClass} px-4 pt-4 pb-3 flex items-center gap-3`}>
          <Icon className={`${iconClass} size-6 shrink-0`} />
          <DialogHeader>
            <DialogTitle className={`${titleClass} text-base font-semibold`}>
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-4 py-3 space-y-2">
          <DialogDescription className="text-sm text-foreground">
            {message}
          </DialogDescription>
          <p className="text-xs text-muted-foreground">
            Redirection vers <span className="font-medium">{destinationLabel}</span> dans {seconds}s…
          </p>
          <button
            onClick={onNavigate}
            className={`text-xs underline underline-offset-2 ${iconClass} hover:opacity-70 transition-opacity`}
          >
            Continuer maintenant
          </button>
        </div>

        <div className="h-1 bg-muted w-full">
          <div
            className={`h-full ${barClass} transition-all ease-linear`}
            style={{ width: `${progress}%`, transitionDuration: `${duration}ms` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
