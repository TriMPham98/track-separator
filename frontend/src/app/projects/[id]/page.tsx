"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useStore } from "@/store";
import { Project } from "@/types";
import DAWWorkspace from "@/components/daw/DAWWorkspace";
import { Loader2 } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const setProject = useStore((s) => s.setProject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProject(projectId)
      .then((project) => {
        setProject(project);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    return () => {
      useStore.getState().clearProject();
    };
  }, [projectId, setProject]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return <DAWWorkspace />;
}
