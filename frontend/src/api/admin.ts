import { apiClient } from './client';
export const adminApi = {
  listEvents:   (status?: string)            => apiClient.get('/admin/events/', { params: { status } }),
  approveEvent: (id: string)                 => apiClient.put(`/admin/events/${id}/approve/`),
  rejectEvent:  (id: string, reason: string) => apiClient.put(`/admin/events/${id}/reject/`, { reason }),
  cancelEvent:  (id: string)                 => apiClient.put(`/admin/events/${id}/cancel/`),
  deleteEvent:  (id: string)                 => apiClient.delete(`/admin/events/${id}/`),
  listUsers:    (search?: string)            => apiClient.get('/admin/users/', { params: { search } }),
  banUser:      (id: string, ban: boolean)   => apiClient.put(`/admin/users/${id}/ban/`, { ban }),
  auditLog:                (page: number)               => apiClient.get('/admin/audit-log/', { params: { page } }),
  listOrganizerRequests:   (status?: string)            => apiClient.get('/admin/organizer-requests/', { params: { status } }),
  approveOrganizerRequest: (id: string)                 => apiClient.put(`/admin/organizer-requests/${id}/approve/`),
  rejectOrganizerRequest:  (id: string, note?: string)  => apiClient.put(`/admin/organizer-requests/${id}/reject/`, { note }),
};
