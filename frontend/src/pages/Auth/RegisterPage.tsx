import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ATTENDEE', 'ORGANIZER'], { required_error: 'Please select a role' }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ATTENDEE' | 'ORGANIZER'>('ATTENDEE');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ATTENDEE' },
  });

  const handleRoleSelect = (role: 'ATTENDEE' | 'ORGANIZER') => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await authApi.register(data);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      const res = err?.response?.data;
      if (res?.email) setServerError(res.email[0]);
      else if (res?.password) setServerError(res.password[0]);
      else if (res?.non_field_errors) setServerError(res.non_field_errors[0]);
      else setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Eventure</h1>
          <p className="mt-2 text-sm text-gray-500">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            {serverError && (
              <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">I am a...</span>
              <div className="grid grid-cols-2 gap-3">
                {(['ATTENDEE', 'ORGANIZER'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    aria-pressed={selectedRole === role}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selectedRole === role
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {role === 'ATTENDEE' ? 'Attendee' : 'Organizer'}
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.role.message}
                </p>
              )}
              {selectedRole === 'ORGANIZER' && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                  Your organizer request will be reviewed by an admin. Until approved, you'll have attendee access.
                </div>
              )}
            </div>

            <Button type="submit" fullWidth loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
