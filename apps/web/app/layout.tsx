import { Geist_Mono, Outfit, Instrument_Serif } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { RoleProvider } from "@/lib/role-context"
import { cn } from "@workspace/ui/lib/utils";

const instrumentSerifHeading = Instrument_Serif({subsets:['latin'],weight:['400'],variable:'--font-heading'});

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable, instrumentSerifHeading.variable)}
    >
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body>
        <ThemeProvider>
          <RoleProvider>{children}</RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
