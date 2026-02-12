"use client";

import { useCallback, useState } from "react";
import { Upload, Music } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadDropzone({
  onFileSelected,
  disabled,
}: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && isAudioFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer
        ${dragOver ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 hover:border-zinc-500"}
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <label className="cursor-pointer flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
          {dragOver ? (
            <Music className="w-8 h-8 text-blue-400" />
          ) : (
            <Upload className="w-8 h-8 text-zinc-400" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-zinc-200">
            Drop your audio file here
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            or click to browse (MP3, WAV, FLAC up to 100MB)
          </p>
        </div>
        <input
          type="file"
          accept=".mp3,.wav,.flac"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </label>
    </div>
  );
}

function isAudioFile(file: File) {
  return /\.(mp3|wav|flac)$/i.test(file.name);
}
