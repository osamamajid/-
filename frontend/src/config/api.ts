import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api')
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error(
    '[Aqeed] VITE_API_URL is not set. API requests will use relative /api which may fail in production.'
  );
}

// Request Interceptor: إضافة توكن المصادقة Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aqeed_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: التعامل مع انتهاء الصلاحية أو الأخطاء العامة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // إذا انتهت الجلسة وكان المسار ليس تسجيل الدخول
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('aqeed_token');
        localStorage.removeItem('aqeed_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
