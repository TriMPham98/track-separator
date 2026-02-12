"use client";

import { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { useStore } from "@/store";
import { useExport } from "@/hooks/useExport";
import { api } from "@/lib/api";

export default function ExportDialog() {
  const exportOpen = useStore((s) => s.exportOpen);
  const setExportOpen = useStore((s) => s.setExportOpen);
  const project = useStore((s) => s.project);
  const { exportMix, exporting, error } = useExport();
  const [format, setFormat] = useState<"wav" | "mp3">("wav");

  if (!exportOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-96 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Export Mix</h2>
          <button
            onClick={() => setExportOpen(false)}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Format</label>
            <div className="flex gap-2">
              {(["wav", "mp3"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    format === f
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={() => exportMix(format)}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Mix
              </>
            )}
          </button>
        </div>

        {/* Individual stem downloads */}
        {project && project.stems.length > 0 && (
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">
              Download Individual Stems
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {project.stems.map((stem) => (
                <a
                  key={stem}
                  href={api.getStemUrl(project.id, stem)}
                  download
                  className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-3 h-3" />
                  {stem}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
