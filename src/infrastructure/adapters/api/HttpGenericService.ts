import { create } from 'axios';
import type { AxiosInstance } from 'axios';

export class HttpGenericService {
  private static instance: HttpGenericService;
  private readonly client: AxiosInstance;

  private constructor() {
    let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    console.log("🚀 URL FINAL CONFIGURADA EN AXIOS:", url);
    this.client = create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static getInstance(): HttpGenericService {
    if (!this.instance) {
      this.instance = new HttpGenericService();
    }
    return this.instance;
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}
