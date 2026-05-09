import { useQuery } from '@tanstack/react-query';
import { eventsApi, EventListParams } from '../api/events';
export function useEvents(params: EventListParams) {
  return useQuery({ queryKey: ['events', params], queryFn: () => eventsApi.list(params).then(r => r.data) });
}
export function useEvent(id: string) {
  return useQuery({ queryKey: ['event', id], queryFn: () => eventsApi.getById(id).then(r => r.data), enabled: !!id });
}
