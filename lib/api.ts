const TOKEN_KEY = "tm_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "เกิดข้อผิดพลาดในการเรียก API");
  }
  return data;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  teamName?: string;
}) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type TaskFilters = {
  q?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  sortBy?: string;
  order?: string;
};

export function getTasks(filters: TaskFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return apiFetch(`/api/tasks${qs ? `?${qs}` : ""}`);
}

export function createTask(input: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: string;
}) {
  return apiFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTask(id: string) {
  return apiFetch(`/api/tasks/${id}`);
}

export function updateTask(id: string, input: Record<string, unknown>) {
  return apiFetch(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function addComment(taskId: string, content: string) {
  return apiFetch(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function getDashboard(teamId?: string) {
  const qs = teamId ? `?teamId=${teamId}` : "";
  return apiFetch(`/api/dashboard${qs}`);
}

export function getTeamMembers() {
  return apiFetch("/api/team/members");
}

export function inviteMember(email: string, role?: string) {
  return apiFetch("/api/team/invite", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function getMyInvitations() {
  return apiFetch("/api/invitations");
}

export function acceptInvitation(token: string) {
  return apiFetch(`/api/invitations/${token}/accept`, { method: "POST" });
}

export function getNotifications() {
  return apiFetch("/api/notifications");
}

export function markAllNotificationsRead() {
  return apiFetch("/api/notifications", { method: "PATCH" });
}

export function markNotificationRead(id: string) {
  return apiFetch(`/api/notifications/${id}`, { method: "PATCH" });
}
