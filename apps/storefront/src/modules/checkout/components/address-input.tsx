"use client"

import { useEffect, useRef, useState, ComponentProps } from "react"
import Input from "@modules/common/components/input"
import { addressFieldError } from "@lib/util/address-validation"

export default function AddressInput({ onChange, onBlur, ...props }: ComponentProps<typeof Input>) {
  const ref = useRef<HTMLInputElement>(null)
  const [touched, setTouched] = useState(false)
  const error = addressFieldError(props.name, props.value, !!props.required)
  useEffect(() => { ref.current?.setCustomValidity(error) }, [error])
  return <div>
    <Input {...props} ref={ref} id={props.name} aria-invalid={touched && !!error}
      aria-describedby={touched && error ? `${props.name}-error` : undefined}
      onInvalid={() => setTouched(true)}
      onChange={(event) => { event.target.setCustomValidity(addressFieldError(props.name, event.target.value, !!props.required)); onChange?.(event) }}
      onBlur={(event) => { setTouched(true); onBlur?.(event) }} />
    {touched && error && <p id={`${props.name}-error`} className="mt-1 text-xs text-red-700" role="alert">{error}</p>}
  </div>
}
