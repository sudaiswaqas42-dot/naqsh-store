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

  // Sizing map calibrated for increased width and prominent luxury brand presence
  const sizeMap = {
    sm: "w-32 sm:w-36 md:w-40 h-auto",
    md: "w-44 sm:w-52 md:w-60 lg:w-68 xl:w-72 h-auto",
    lg: "w-60 sm:w-68 md:w-76 lg:w-84 xl:w-92 h-auto",
    xl: "w-72 sm:w-80 md:w-92 lg:w-[420px] h-auto",
    "2xl": "w-84 sm:w-96 md:w-[420px] lg:w-[480px] h-auto",
  }

  // Use the gold transparent logo for light variant (e.g. on dark green footer)
  const src = isLight ? "/images/naqsh-logo-footer.png" : "/images/naqsh-logo.png"

  return (
    <div
      className={`bg-transparent inline-flex items-center justify-center select-none ${className}`}
    >
      <Image
        src={src}
        alt="NAQSH"
        width={isLight ? 1332 : 1447}
        height={isLight ? 485 : 505}
        priority={priority}
        className={`${sizeMap[size]} object-contain drop-shadow-2xs transition-transform duration-300 hover:scale-[1.02]`}
      />
    </div>
  )
}
