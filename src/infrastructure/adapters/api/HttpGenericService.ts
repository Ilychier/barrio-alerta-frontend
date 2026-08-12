import { create } from 'axios';
import type { AxiosInstance } from 'axios';
import { TokenStorage } from '../storage/TokenStorage';

export class HttpGenericService {
  private static instance: HttpGenericService;
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  private constructor() {
    let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    this.baseUrl = url;
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

    this.client.interceptors.request.use(async (config) => {
      const token = await TokenStorage.instance.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
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

  getBaseUrl(): string {
    // Quitar /api del final para que sea la raíz del dominio
    return this.baseUrl.replace(/\/api$/, '');
  }
}
