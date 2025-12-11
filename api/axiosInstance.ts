import axios from 'axios';

const api = axios.create({
  baseURL: 'https://facilities.astrikdigital.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const loginId = localStorage.getItem('loginId');
    if (loginId) {
      (config.headers as any)['LoginId'] = loginId;
    }
  }
  return config;
});

export default api;
