// ============================================================
// components/analytics-provider.tsx
// Wrapper à placer dans votre app/layout.tsx
// ============================================================
"use client";

import { useAnalytics } from "@/hooks/use-analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}
