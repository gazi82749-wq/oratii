import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-indigo-200">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mt-4 mb-4">Page not found</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>
        <Button href="/" variant="primary" size="lg">
          Return Home
        </Button>
      </div>
    </div>
  );
}
