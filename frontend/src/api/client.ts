const API_BASE_URL = "http://localhost:8000";

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileData {
  discipline: string | null;
  bio: string | null;
  skills: string | null;
  location: string | null;
  portfolio_views: number;
}

export interface DataProject {
  id: number;
  name: string;
  description: string;
  source: string;
  pipeline_status: string;
  records_processed: number;
  last_run_at: string | null;
}

export interface DataProjectCreatePayload {
  name: string;
  description: string;
  source: string;
}

// A small helper so every call handles errors the same way instead of
// repeating try/catch + response.ok checks in every component.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Something went wrong" }));
    throw new Error(body.detail ?? "Request failed");
  }

  return response.json();
}

export function registerUser(payload: RegisterPayload) {
  return request<{ id: number; email: string; full_name: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<{ access_token: string; token_type: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyProfile(token: string) {
  return request<ProfileData>("/profiles/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateMyProfile(token: string, payload: Partial<ProfileData>) {
  return request<ProfileData>("/profiles/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export interface DataProjectRunPayload {
  records_ingested?: number;
  pipeline_status?: string;
}

export function runDataProject(
  token: string,
  projectId: number,
  payload: DataProjectRunPayload
) {
  return request<DataProject>(`/data-projects/${projectId}/run`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function getDataProjects(token: string) {
  return request<DataProject[]>("/data-projects/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createDataProject(token: string, payload: DataProjectCreatePayload) {
  return request<DataProject>("/data-projects/me", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
