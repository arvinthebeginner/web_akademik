const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'GET',
  });
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
  });
}
