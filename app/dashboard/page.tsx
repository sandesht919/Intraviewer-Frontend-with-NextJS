/**
 * Example Protected Page
 * 
 * This demonstrates how to use the RouteGuard component
 * to protect a page that requires authentication.
 */

'use client';

import { RouteGuard } from '@/components/guards/RouteGuard';
import { useAuthStore } from '@/lib/stores/authStore';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dashboard
            </h1>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This is a protected page. Only authenticated users can see this.
              </p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-3">User Information</h2>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                </div>
                {user?.created_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
