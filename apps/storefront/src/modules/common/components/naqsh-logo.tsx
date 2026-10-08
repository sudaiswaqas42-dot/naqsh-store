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
    sm: isLight ? "w-36 sm:w-40 h-auto" : "h-11 sm:h-12 w-auto",
    md: isLight ? "w-52 sm:w-60 md:w-68 h-auto" : "h-20 sm:h-24 md:h-26 w-auto",
    lg: isLight ? "w-60 sm:w-68 md:w-76 h-auto" : "h-24 sm:h-28 md:h-30 w-auto",
    xl: isLight ? "w-72 sm:w-80 md:w-92 h-auto" : "h-28 sm:h-32 md:h-36 w-auto",
    "2xl": isLight ? "w-80 sm:w-96 md:w-[420px] h-auto" : "w-72 sm:w-84 md:w-96 lg:w-[420px] h-auto",
  }

  // Use the gold transparent logo for light variant (e.g. on dark green footer)
  const src = isLight ? "/images/naqsh-logo-footer.png" : "/images/naqsh-logo.png"

  return (
    <div
      className={`bg-transparent inline-flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* Container with bottom clip-path to crop out the tagline, showing only the bold NAQSH emblem */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ clipPath: "inset(0 0 23% 0)", marginBottom: "-5.5%" }}
      >
        <Image
          src={src}
          alt="NAQSH"
          width={isLight ? 1332 : 1536}
          height={isLight ? 550 : 1024}
          priority={priority}
          className={`${sizeMap[size]} object-contain drop-shadow-2xs transition-transform duration-300 hover:scale-[1.02]`}
        />
      </div>
    </div>
  )
}
