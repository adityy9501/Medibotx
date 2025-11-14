import api from './api';

export const authService = {
  async signup(email, password) {
    const response = await api.post('/api/auth/signup', { email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
