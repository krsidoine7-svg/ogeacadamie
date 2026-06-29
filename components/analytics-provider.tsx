"use client";

import React from "react";
import { useAnalytics } from "@/hooks/use-analytics";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useAnalytics();
  return <>{children}</>;
}
