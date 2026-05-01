"use client"

import { useEffect, type CSSProperties } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  useEffect(() => {
    function dismissOnOutsideClick(event: PointerEvent) {
      const target = event.target

      if (target instanceof Element && target.closest("[data-sonner-toast]")) {
        return
      }

      toast.dismiss()
    }

    document.addEventListener("pointerdown", dismissOnOutsideClick)

    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsideClick)
    }
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton={false}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          success: "!border-emerald-200 !bg-emerald-50 !text-emerald-800",
          error: "!border-red-200 !bg-red-50 !text-red-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
