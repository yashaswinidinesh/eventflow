export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div role="status" aria-label="Loading">
      <div className={`${s} animate-spin rounded-full border-4 border-blue-600 border-t-transparent`} />
    </div>
  );
}
