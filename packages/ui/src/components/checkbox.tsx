"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type CheckboxProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  ...props
}: CheckboxProps) {
  const [isChecked, setIsChecked] = React.useState(
    checked !== undefined ? checked : defaultChecked
  )

  React.useEffect(() => {
    if (checked !== undefined) setIsChecked(checked)
  }, [checked])

  return (
    <button
      data-slot="checkbox"
      role="checkbox"
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
        "peer size-4 shrink-0 rounded border border-input shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      {isChecked && <CheckIcon className="size-3 m-auto" />}
    </button>
  )
}

export { Checkbox }
