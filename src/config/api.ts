// src/config/api.ts
// Single source of truth for backend URL
// In development: uses localhost:5000
// In production: uses VITE_API_URL from .env

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;