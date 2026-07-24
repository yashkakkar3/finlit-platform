const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('finlit_token');
}

function setToken(token) {
  if (token) localStorage.setItem('finlit_token', token);
  else localStorage.removeItem('finlit_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (email, password, display_name) =>
    request('/auth/register', { method: 'POST', body: { email, password, display_name }, auth: false }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  getLearningTree: () => request('/learning-tree'),
  getLesson: (lessonId) => request(`/lessons/${lessonId}`),
  submitQuiz: (lessonId, answers) =>
    request(`/lessons/${lessonId}/submit`, { method: 'POST', body: { answers } }),
  getLeaderboard: (week) => request(`/leaderboard${week ? `?week=${week}` : ''}`),
  setToken,
  getToken,
};
