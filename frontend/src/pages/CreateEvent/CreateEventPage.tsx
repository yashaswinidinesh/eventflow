import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventsApi } from '../../api/events';
import { ticketsApi } from '../../api/tickets';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const CATEGORIES = [
  'Technology', 'Music', 'Food & Drink', 'Arts', 'Sports',
  'Business', 'Health', 'Education', 'Networking', 'Community',
] as const;

const schema = z
  .object({
    title:       z.string().min(3, 'Title must be at least 3 characters'),
    category:    z.enum(CATEGORIES, { required_error: 'Select a category' }),
    date:        z.string().min(1, 'Date is required'),
    start_time:  z.string().min(1, 'Start time is required'),
    end_time:    z.string().min(1, 'End time is required'),
    venue_name:  z.string().optional(),
    address:     z.string().optional(),
    capacity:    z.coerce.number().min(1, 'Capacity must be at least 1').max(100000),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    is_online:    z.boolean(),
    cover_image:  z.string().url('Enter a valid image URL').optional().or(z.literal('')),
    is_free:      z.boolean(),
    ticket_price: z.coerce.number().min(0).optional(),
  })
  .refine(d => d.end_time > d.start_time, {
    message: 'End time must be after start time',
    path: ['end_time'],
  })
  .refine(d => d.is_online || (d.venue_name && d.venue_name.length >= 3), {
    message: 'Venue name is required for in-person events',
    path: ['venue_name'],
  });

type FormData = z.infer<typeof schema>;

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_online: false, is_free: true },
  });

  const isOnline = watch('is_online');
  const isFree   = watch('is_free');

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const payload: Record<string, unknown> = {
      title:       data.title,
      category:    data.category,
      start_at:    `${data.date}T${data.start_time}:00`,
      end_at:      `${data.date}T${data.end_time}:00`,
      capacity:    data.capacity,
      description: data.description,
      is_online:   data.is_online,
    };
    if (!data.is_online) {
      payload.venue_name = data.venue_name;
      if (data.address) payload.address = data.address;
    }
    if (data.cover_image) payload.cover_image = data.cover_image;

    try {
      const res = await eventsApi.create(payload);
      const eventId = res.data.id;
      await ticketsApi.createTier(eventId, {
        name:     'General Admission',
        price:    data.is_free ? 0 : (data.ticket_price ?? 0),
        quantity: data.capacity,
      });
      await eventsApi.publish(eventId);
      navigate('/dashboard', { state: { created: true } });
    } catch (err: any) {
      const detail = err?.response?.data?.error?.details;
      if (detail) {
        const msgs = Object.values(detail).flat().join(' ');
        setServerError(msgs);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your event will be reviewed by an admin before it goes live.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

          {serverError && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Input
            label="Event Title"
            placeholder="e.g. SV Tech Summit 2026"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              {...register('category')}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && (
              <p className="text-xs text-red-600" role="alert">{errors.category.message}</p>
            )}
          </div>

          <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" error={errors.start_time?.message} {...register('start_time')} />
            <Input label="End Time"   type="time" error={errors.end_time?.message}   {...register('end_time')} />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_online"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('is_online')}
            />
            <label htmlFor="is_online" className="text-sm font-medium text-gray-700">
              This is an online event
            </label>
          </div>

          {!isOnline && (
            <>
              <Input
                label="Venue Name"
                placeholder="e.g. San Jose Convention Center"
                error={errors.venue_name?.message}
                {...register('venue_name')}
              />
              <Input
                label="Address (optional)"
                placeholder="e.g. 150 W San Carlos St, San Jose, CA"
                error={errors.address?.message}
                {...register('address')}
              />
            </>
          )}

          <Input
            label="Capacity"
            type="number"
            min={1}
            placeholder="100"
            error={errors.capacity?.message}
            {...register('capacity')}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe your event in at least 20 characters..."
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-600" role="alert">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Ticket Pricing</span>
            <div className="flex items-center gap-3">
              <input
                id="is_free"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('is_free')}
              />
              <label htmlFor="is_free" className="text-sm text-gray-700">Free event</label>
            </div>
            {!isFree && (
              <Input
                label="Ticket Price (USD)"
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 25.00"
                error={errors.ticket_price?.message}
                {...register('ticket_price')}
              />
            )}
          </div>

          <Input
            label="Cover Image URL (optional)"
            type="url"
            placeholder="https://example.com/image.jpg"
            error={errors.cover_image?.message}
            {...register('cover_image')}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} fullWidth>Submit for Review</Button>
            <Button type="button" variant="outline" fullWidth onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
