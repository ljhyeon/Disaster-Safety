// src/api/client.js
// 이 파일은 추후 API 연동 시 사용됩니다.
// 커스텀 API 클라이언트

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // API 요청을 처리하는 메서드
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  }

  // GET 요청
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  // POST 요청
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 요청
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 요청
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// ApiClient 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();
