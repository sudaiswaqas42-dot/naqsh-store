import React from "react"
import Image from "next/image"

interface NaqshLogoProps {
  variant?: "dark" | "light"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  priority?: boolean
}

export default function NaqshLogo({
  variant = "dark",
  size = "md",
  className = "",
  priority = true,
}: NaqshLogoProps) {
  // Sizing map calibrated for luxury proportion
  const sizeMap = {
    sm: "h-9 sm:h-10 w-auto",
    md: "h-11 sm:h-13 md:h-14 w-auto",
    lg: "h-14 sm:h-16 md:h-18 w-auto",
    xl: "h-18 sm:h-22 md:h-24 w-auto",
  }

  const src = variant === "light" 
    ? "/images/naqsh-logo-light.png" 
    : "/images/naqsh-logo-dark.png"

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <Image
        src={src}
        alt="NAQSH — Where Identity Begins"
        width={806}
        height={345}
        priority={priority}
        className={`${sizeMap[size]} object-contain drop-shadow-2xs transition-transform duration-300 hover:scale-[1.02]`}
      />
    </div>
  )
}
