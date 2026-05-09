import { apiClient } from './client';
export interface EventListParams { search?: string; category?: string; page?: number; limit?: number; }
export const eventsApi = {
  list:     (params: EventListParams) => apiClient.get('/events/', { params }),
  myEvents: ()                        => apiClient.get('/events/', { params: { mine: true } }),
  getById:  (id: string)              => apiClient.get(`/events/${id}/`),
  create:   (data: unknown)           => apiClient.post('/events/', data),
  update:   (id: string, data: unknown) => apiClient.put(`/events/${id}/`, data),
  delete:   (id: string)              => apiClient.delete(`/events/${id}/`),
  publish:  (id: string)              => apiClient.post(`/events/${id}/publish/`),
  cancel:   (id: string)              => apiClient.post(`/events/${id}/cancel/`),
};
