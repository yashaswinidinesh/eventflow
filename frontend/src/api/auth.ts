import { apiClient } from './client';
export const authApi = {
  register: (data: unknown) => apiClient.post('/auth/register/', data),
  login:    (data: unknown) => apiClient.post('/auth/login/', data),
  refresh:  () => apiClient.post('/auth/token/refresh/'),
  logout:   (refresh: string) => apiClient.post('/auth/logout/', { refresh }),
  me:       () => apiClient.get('/auth/me/'),
};
