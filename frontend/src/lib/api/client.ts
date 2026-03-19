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
      throw new ApiError(response.status, errorData.detail || response.statusText, errorData);
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
}

export const apiClient = new ApiClient();
