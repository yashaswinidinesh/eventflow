import { apiClient } from './client';
export const ticketsApi = {
  listTiers:      (eventId: string)               => apiClient.get(`/tickets/events/${eventId}/tiers/`),
  createTier:     (eventId: string, data: unknown) => apiClient.post(`/tickets/events/${eventId}/tiers/`, data),
  register:       (eventId: string, data: unknown) => apiClient.post(`/tickets/events/${eventId}/register/`, data),
  myTickets:      ()                               => apiClient.get('/tickets/my-tickets/'),
  getRegistration:(regId: string)                  => apiClient.get(`/tickets/registrations/${regId}/`),
  cancel:         (regId: string)                  => apiClient.post(`/tickets/registrations/${regId}/cancel/`),
  listAttendees:  (eventId: string, page: number)  => apiClient.get(`/tickets/events/${eventId}/attendees/`, { params: { page } }),
  checkIn:        (eventId: string, qrCode: string) => apiClient.post(`/tickets/events/${eventId}/checkin/`, { qr_code: qrCode }),
  exportAttendees:(eventId: string)                => apiClient.get(`/tickets/events/${eventId}/attendees/export/`),
};
