"use client";

import { useEffect, useState } from "react";
import { createJobWebSocket } from "@/lib/api";
import { STEM_NAMES, StemName } from "@/types";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface SeparationProgressProps {
  jobId: number;
  onComplete: (stems: string[]) => void;
}

export default function SeparationProgress({
  jobId,
  onComplete,
}: SeparationProgressProps) {
  const [status, setStatus] = useState<string>("pending");
  const [stemsFound, setStemsFound] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = createJobWebSocket(jobId);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "status") {
        setStatus(data.status);
        if (data.stems_found) setStemsFound(data.stems_found);
        if (data.status === "completed") {
          onComplete(data.stems_found || []);
        }
        if (data.status === "failed") {
          setError(data.error || "Separation failed");
        }
      }
      if (data.type === "stem_complete") {
        setStemsFound(data.stems_found);
      }
    };

    ws.onerror = () => setError("WebSocket connection error");

    return () => ws.close();
  }, [jobId, onComplete]);

  return (
    <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        {status === "failed" ? (
          <XCircle className="w-5 h-5 text-red-400" />
        ) : status === "completed" ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        )}
        <span className="text-zinc-200 font-medium">
          {status === "pending" && "Waiting to start..."}
          {status === "processing" && "Separating tracks..."}
          {status === "completed" && "Separation complete!"}
          {status === "failed" && "Separation failed"}
        </span>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="grid grid-cols-3 gap-2">
        {STEM_NAMES.map((stem) => (
          <StemBadge
            key={stem}
            name={stem}
            done={stemsFound.includes(stem)}
          />
        ))}
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(stemsFound.length / STEM_NAMES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StemBadge({ name, done }: { name: StemName; done: boolean }) {
  return (
    <div
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium text-center transition-colors
        ${done ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"}
      `}
    >
      {name}
    </div>
  );
}
