import type React from "react"
import { Navigation } from "@/components/navigation"

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
