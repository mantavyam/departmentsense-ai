"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  const [isChecked, setIsChecked] = React.useState(
    checked !== undefined ? checked : defaultChecked
  )

  React.useEffect(() => {
    if (checked !== undefined) setIsChecked(checked)
  }, [checked])

  return (
    <button
      data-slot="switch"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        const next = !isChecked
        setIsChecked(next)
        onCheckedChange?.(next)
      }}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
        data-state={isChecked ? "checked" : "unchecked"}
      />
    </button>
  )
}

export { Switch }
