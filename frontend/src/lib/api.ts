import { Project, ProjectListItem, Job, UploadResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  upload(file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    return fetchJson("/api/upload", { method: "POST", body: form });
  },

  getProject(id: number): Promise<Project> {
    return fetchJson(`/api/projects/${id}`);
  },

  listProjects(): Promise<ProjectListItem[]> {
    return fetchJson("/api/projects");
  },

  deleteProject(id: number): Promise<void> {
    return fetchJson(`/api/projects/${id}`, { method: "DELETE" });
  },

  getJob(id: number): Promise<Job> {
    return fetchJson(`/api/jobs/${id}`);
  },

  getStemUrl(projectId: number, stemName: string): string {
    return `${API_BASE}/api/projects/${projectId}/stems/${stemName}`;
  },

  startSeparation(projectId: number): Promise<Job> {
    return fetchJson(`/api/projects/${projectId}/separate`, { method: "POST" });
  },
};

export function createJobWebSocket(jobId: number): WebSocket {
  const wsBase = API_BASE.replace(/^http/, "ws");
  return new WebSocket(`${wsBase}/ws/jobs/${jobId}`);
}
