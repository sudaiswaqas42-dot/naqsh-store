import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "NAQSH — Pakistani Luxury Fashion & Apparel",
  description: "Handcrafted lawn, pure silks, and artisanal Pakistani couture tailored for modern sensibilities.",
}

import Providers from "./providers"

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased text-brand bg-white selection:bg-accent selection:text-white">
        <Providers>
          <main className="relative">{props.children}</main>
        </Providers>
      </body>
    </html>
  )
}
