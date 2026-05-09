import React from 'react';

type Variant = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple' | 'orange' | 'teal' | 'indigo' | 'pink';

const CATEGORY_COLOR: Record<string, Variant> = {
  Technology: 'blue', Music: 'purple', 'Food & Drink': 'orange',
  Arts: 'pink', Sports: 'green', Business: 'yellow',
  Health: 'red', Education: 'indigo', Networking: 'teal', Community: 'gray',
};

const VARIANT_STYLES: Record<Variant, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  teal:   'bg-teal-100 text-teal-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  pink:   'bg-pink-100 text-pink-700',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  category?: string;
}

export default function Badge({ children, variant, category }: BadgeProps) {
  const key = category ?? (typeof children === 'string' ? children : '');
  const v = variant ?? CATEGORY_COLOR[key] ?? 'gray';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_STYLES[v]}`}>
      {children}
    </span>
  );
}
