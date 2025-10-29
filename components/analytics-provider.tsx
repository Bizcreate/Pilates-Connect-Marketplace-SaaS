"use client"

import { createContext, useContext, type ReactNode } from "react"
import { trackEvent } from "@/lib/analytics"

const AnalyticsContext = createContext(trackEvent)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return <AnalyticsContext.Provider value={trackEvent}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  return useContext(AnalyticsContext)
}
