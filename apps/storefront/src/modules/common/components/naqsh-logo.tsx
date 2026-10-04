import React from "react"
import Image from "next/image"

interface NaqshLogoProps {
  variant?: "dark" | "light"
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  className?: string
  priority?: boolean
}

export default function NaqshLogo({
  variant = "dark",
  size = "md",
  className = "",
  priority = true,
}: NaqshLogoProps) {
  const isLight = variant === "light"

  // Sizing map calibrated for luxury proportion
  const sizeMap = {
    sm: isLight ? "w-32 sm:w-36 h-auto" : "h-9 sm:h-10 w-auto",
    md: isLight ? "w-44 sm:w-48 md:w-52 h-auto" : "h-16 sm:h-18 md:h-20 w-auto",
    lg: isLight ? "w-52 sm:w-56 md:w-60 h-auto" : "h-20 sm:h-24 md:h-26 w-auto",
    xl: isLight ? "w-60 sm:w-64 md:w-72 h-auto" : "h-24 sm:h-28 md:h-32 w-auto",
    "2xl": isLight ? "w-72 sm:w-80 md:w-96 h-auto" : "w-64 sm:w-72 md:w-80 lg:w-96 h-auto",
  }

  // Use the gold transparent logo for light variant (e.g. on dark green footer)
  const src = isLight ? "/images/naqsh-logo-footer.png" : "/images/naqsh-logo.png"

  return (
    <div
      className={`bg-transparent rounded-sm inline-flex items-center justify-center select-none ${className}`}
    >
      <Image
        src={src}
        alt="NAQSH — Where Identity Begins"
        width={isLight ? 1332 : 1536}
        height={isLight ? 550 : 1024}
        priority={priority}
        className={`${sizeMap[size]} object-contain drop-shadow-2xs transition-transform duration-300 hover:scale-[1.02]`}
      />
    </div>
  )
}
