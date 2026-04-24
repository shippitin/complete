import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shippitin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shippitin_token');
      localStorage.removeItem('shippitin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================
export const authAPI = {
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    company_name?: string;
  }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ============================================
// BOOKINGS
// ============================================
export const bookingAPI = {
  create: (data: any) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
};

// ============================================
// TRACKING
// ============================================
export const trackingAPI = {
  track: (bookingNumber: string) => api.get(`/tracking/${bookingNumber}`),
  addEvent: (bookingId: string, data: any) => api.post(`/tracking/${bookingId}/events`, data),
};

// ============================================
// USER
// ============================================
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (data: {
    current_password: string;
    new_password: string;
  }) => api.put('/users/change-password', data),
  getWallet: () => api.get('/users/wallet'),
};

// ============================================
// RAIL — CONCOR
// ============================================
export const railAPI = {
  getQuotes: (data: any) => api.post('/quotes/rail/quotes', data),
  book: (data: any) => api.post('/quotes/rail/book', data),
  getTerminals: () => api.get('/quotes/rail/terminals'),
  track: (indentNumber: string) => api.get(`/quotes/rail/track/${indentNumber}`),
};

// ============================================
// SEA FREIGHT
// ============================================
export const seaAPI = {
  getQuotes: (data: any) => api.post('/quotes/sea/quotes', data),
  book: (data: any) => api.post('/quotes/sea/book', data),
  getPorts: () => api.get('/quotes/sea/ports'),
  track: (blNumber: string) => api.get(`/quotes/sea/track/${blNumber}`),
};

// ============================================
// AIR FREIGHT
// ============================================
export const airAPI = {
  getQuotes: (data: any) => api.post('/quotes/air/quotes', data),
  book: (data: any) => api.post('/quotes/air/book', data),
  getAirports: () => api.get('/quotes/air/airports'),
  track: (awbNumber: string) => api.get(`/quotes/air/track/${awbNumber}`),
};

// ============================================
// TRUCK
// ============================================
export const truckAPI = {
  getQuotes: (data: any) => api.post('/quotes/truck/quotes', data),
  book: (data: any) => api.post('/quotes/truck/book', data),
  track: (lrNumber: string) => api.get(`/quotes/truck/track/${lrNumber}`),
};

// ============================================
// CUSTOMS
// ============================================
export const customsAPI = {
  getQuote: (data: any) => api.post('/quotes/customs/quote', data),
  file: (data: any) => api.post('/quotes/customs/file', data),
  getStatus: (beNumber: string) => api.get(`/quotes/customs/status/${beNumber}`),
  getHSCode: (hsCode: string) => api.get(`/quotes/customs/hscode/${hsCode}`),
};

// ============================================
// PORT SERVICES
// ============================================
export const portAPI = {
  getQuote: (data: any) => api.post('/quotes/port/quote', data),
  book: (data: any) => api.post('/quotes/port/book', data),
  getStatus: (portCallNumber: string) => api.get(`/quotes/port/status/${portCallNumber}`),
  getPorts: () => api.get('/quotes/port/list'),
};

// ============================================
// INSURANCE
// ============================================
export const insuranceAPI = {
  getQuotes: (data: any) => api.post('/quotes/insurance/quotes', data),
  createPolicy: (data: any) => api.post('/quotes/insurance/policy', data),
  fileClaim: (data: any) => api.post('/quotes/insurance/claim', data),
};

// ============================================
// LCL
// ============================================
export const lclAPI = {
  getQuotes: (data: any) => api.post('/quotes/lcl/quotes', data),
  book: (data: any) => api.post('/quotes/lcl/book', data),
  track: (hblNumber: string) => api.get(`/quotes/lcl/track/${hblNumber}`),
};

// ============================================
// PARCEL
// ============================================
export const parcelAPI = {
  getQuotes: (data: any) => api.post('/quotes/parcel/quotes', data),
  book: (data: any) => api.post('/quotes/parcel/book', data),
  track: (awbNumber: string) => api.get(`/quotes/parcel/track/${awbNumber}`),
};
// ============================================
// PAYMENTS — RAZORPAY
// ============================================
export const paymentAPI = {
  createOrder: (data: { amount: number; bookingId: string; currency?: string }) =>
    api.post('/payments/create-order', data),
  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId: string;
    amount: number;
  }) => api.post('/payments/verify', data),
  refund: (data: { paymentId: string; amount: number; bookingId: string }) =>
    api.post('/payments/refund', data),
  getStatus: (bookingId: string) => api.get(`/payments/status/${bookingId}`),
};
// ============================================
// RATE CARDS — Shippitin managed quotes
// ============================================
export const rateCardsAPI = {
  search: (params: { serviceType: string; origin: string; destination: string; weight?: number; numberOfContainers?: number; containerType?: string }) =>
    api.get('/quotes/rate-cards/search', { params }),
  getAll: () => api.get('/quotes/rate-cards'),
  create: (data: any) => api.post('/quotes/rate-cards', data),
  update: (id: string, data: any) => api.put(`/quotes/rate-cards/${id}`, data),
  delete: (id: string) => api.delete(`/quotes/rate-cards/${id}`),
};

export default api;