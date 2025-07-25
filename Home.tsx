/**
 * Home page component that redirects to dashboard
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Loading Inventory System...
        </h1>
      </div>
    </div>
  );
}
