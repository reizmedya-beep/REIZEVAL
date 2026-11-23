const DEFAULT_API_URL = process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'https://reizeval-api.onrender.com';

class ReizevalApiClient {
  private token: string | null = null;
  private customBaseUrl: string | null = null;

  public getBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reizeval_custom_api_url');
      if (saved) return saved;
    }
    return DEFAULT_API_URL;
  }

  public setBaseUrl(url: string | null) {
    this.customBaseUrl = url ? url.trim().replace(/\/+$/, '') : null;
    if (typeof window !== 'undefined') {
      if (this.customBaseUrl) {
        localStorage.setItem('reizeval_custom_api_url', this.customBaseUrl);
      } else {
        localStorage.removeItem('reizeval_custom_api_url');
      }
    }
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.getBaseUrl()}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Hatası: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.warn(`[REIZEVAL API] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth
  async login(email: string, password?: string) {
    const res = await this.request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }

  async getUsers() {
    return this.request<{ success: boolean; data: any[] }>('/api/v1/users');
  }

  // Projects
  async getProjects() {
    return this.request<{ success: boolean; data: any[] }>('/api/v1/projects');
  }

  async getProject(id: string) {
    return this.request<{ success: boolean; project: any }>(`/api/v1/projects/${id}`);
  }

  // Multi-Archive Upload (up to 4-5 ZIPs, 100 GB)
  async uploadMultiArchives(projectId: string, archives: Array<{
    fileName: string;
    fileSizeBytes: number;
    sizeFormatted: string;
    sha256: string;
    format: 'ZIP' | 'RAR';
    category?: string;
  }>) {
    return this.request<{ success: boolean; project: any }>(`/api/v1/projects/${projectId}/archives/multi-upload`, {
      method: 'POST',
      body: JSON.stringify({ archives }),
    });
  }

  // Jury Evaluation (100 pts)
  async submitEvaluation(projectId: string, rubric: {
    codeQualityScore: number;
    securityScore: number;
    performanceScore: number;
    functionalityScore: number;
    documentationScore: number;
    technicalReport: string;
    juryId?: string;
    juryName?: string;
    revisionRequested?: boolean;
    revisionDetails?: string;
  }) {
    return this.request<{ success: boolean; evaluation: any }>(`/api/v1/projects/${projectId}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(rubric),
    });
  }

  // Global CTO Approval (Gökçenur Öztürk)
  async approveEvaluation(evaluationId: string) {
    return this.request<{ success: boolean; evaluation: any; certificate: any; project: any }>(`/api/v1/evaluations/${evaluationId}/cto-approve`, {
      method: 'POST',
    });
  }

  // Certificates
  async getCertificates() {
    return this.request<{ success: boolean; data: any[] }>('/api/v1/certificates');
  }

  // Messages
  async getMessages(projectId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/api/v1/projects/${projectId}/messages`);
  }

  async sendMessage(projectId: string, message: { content: string; senderId?: string; senderName: string; senderRole: string }) {
    return this.request<{ success: boolean; message: any }>(`/api/v1/projects/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Version check
  async checkVersion() {
    return this.request<any>('/api/v1/desktop/version');
  }
}

export const apiClient = new ReizevalApiClient();
