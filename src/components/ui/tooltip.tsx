'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

// Context to detect if we're already inside a tooltip
const TooltipDepthContext = React.createContext(0)

const TooltipProvider = TooltipPrimitive.Provider

// Wrap Root to track nesting depth
const Tooltip = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => {
  const depth = React.useContext(TooltipDepthContext)
  return (
    <TooltipDepthContext.Provider value={depth + 1}>
      <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
    </TooltipDepthContext.Provider>
  )
}

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const depth = React.useContext(TooltipDepthContext)
  const isNested = depth > 1

  const content = (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      // Prevent nested tooltip from closing parent on pointer events
      onPointerDownOutside={isNested ? (e) => e.preventDefault() : undefined}
      onEscapeKeyDown={isNested ? (e) => e.preventDefault() : undefined}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]',
        className
      )}
      {...props}
    />
  )

  // Nested tooltips skip Portal to stay in the same stacking context
  // and avoid triggering parent tooltip close
  if (isNested) {
    return content
  }

  return <TooltipPrimitive.Portal>{content}</TooltipPrimitive.Portal>
})

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
