import { getAuth } from "firebase/auth";

export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  private async getHeaders(): Promise<HeadersInit> {
    const auth = getAuth();
    const user = auth.currentUser;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (user) {
      try {
        // Force refresh if the token is close to expiry
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get ID token", error);
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail;
      const message = typeof detail === 'string' 
        ? detail 
        : (typeof detail === 'object' && detail !== null && 'message' in detail)
          ? String(detail.message)
          : response.statusText;
          
      throw new ApiError(response.status, message, errorData);
    }
    return response.json();
  }

  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: any, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      ...options,
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body: any, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      ...options,
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      ...options,
      headers: { ...headers, ...options.headers },
    });
    return this.handleResponse<T>(response);
  }

  async stream(
    path: string, 
    body: any, 
    onChunk: (chunk: string) => void,
    onEvent?: (event: string, data: any) => void,
    options: RequestInit = {}
  ): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      ...options,
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Streaming failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let partialLine = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = (partialLine + chunk).split('\n');
      partialLine = lines.pop() || '';

      let currentEvent = 'message';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.replace('event: ', '').trim();
        } else if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '').trim();
          
          if (currentEvent === 'message') {
            onChunk(data);
          } else {
            try {
              const parsedData = JSON.parse(data);
              onEvent?.(currentEvent, parsedData);
            } catch (e) {
              onEvent?.(currentEvent, data);
            }
          }
          // Reset event to message after processing data
          currentEvent = 'message';
        }
      }
    }
  }
}

export const apiClient = new ApiClient();
