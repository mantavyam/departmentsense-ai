"use client"

import { useCallback, useRef, useState } from "react"

type UseControllableStateParams<T> = {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue as T)
  const isControlled = value !== undefined
  const current = isControlled ? (value as T) : uncontrolled
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setState = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      onChangeRef.current?.(next)
    },
    [isControlled]
  )

  return [current, setState]
}
