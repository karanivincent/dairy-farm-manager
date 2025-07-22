import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page not found</h2>
        <p className="text-lg text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          Go home
        </Link>
      </div>
    </div>
  );
}