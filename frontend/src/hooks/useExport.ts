"use client";

import { useState, useCallback } from "react";
import { renderOffline } from "@/audio/OfflineRenderer";
import { useStore } from "@/store";

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportMix = useCallback(async (format: "wav" | "mp3" = "wav") => {
    setExporting(true);
    setError(null);
    try {
      const state = useStore.getState();
      const blob = await renderOffline(state, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.project?.name ?? "mix"}_export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportMix, exporting, error };
}
