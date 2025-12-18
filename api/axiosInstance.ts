import axios from 'axios';
import { getCookieValue } from '../utils/cookies';

const api = axios.create({
  baseURL: 'https://facilities.astrikdigital.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const loginId = getCookieValue(document.cookie, 'loginId');
    if (loginId) {
      (config.headers as any)['LoginId'] = loginId;
    }
  }
  return config;
});

export default api;
