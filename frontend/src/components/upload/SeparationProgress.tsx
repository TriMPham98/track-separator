"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
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
  const completedRef = useRef(false);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const handleDone = (stems: string[]) => {
      if (completedRef.current || cancelled) return;
      completedRef.current = true;
      onComplete(stems);
    };

    // Poll job status as the primary progress mechanism
    const poll = async () => {
      if (cancelled || completedRef.current) return;
      try {
        const job = await api.getJob(jobId);
        setStatus(job.status);
        setStemsFound(job.stems_found);
        if (job.status === "completed") {
          handleDone(job.stems_found);
        }
        if (job.status === "failed") {
          setError(job.error || "Separation failed");
        }
      } catch {
        // ignore transient errors
      }
    };

    pollInterval = setInterval(poll, 2000);
    poll();

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
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
