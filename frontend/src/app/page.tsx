"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import UploadDropzone from "@/components/upload/UploadDropzone";
import SeparationProgress from "@/components/upload/SeparationProgress";
import { Music } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const res = await api.upload(file);
      setProjectId(res.project_id);
      setJobId(res.job_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleComplete = useCallback(
    (stems: string[]) => {
      if (projectId) {
        setTimeout(() => router.push(`/projects/${projectId}`), 1000);
      }
    },
    [projectId, router]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Music className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold">Track Separator</h1>
          </div>
          <p className="text-zinc-400">
            Upload a song and separate it into individual stems using AI.
            Then mix, edit, and export in the browser DAW.
          </p>
        </div>

        {!jobId && (
          <UploadDropzone
            onFileSelected={handleFileSelected}
            disabled={uploading}
          />
        )}

        {uploading && (
          <p className="text-center text-zinc-400">Uploading...</p>
        )}

        {error && (
          <p className="text-center text-red-400">{error}</p>
        )}

        {jobId && (
          <SeparationProgress jobId={jobId} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
