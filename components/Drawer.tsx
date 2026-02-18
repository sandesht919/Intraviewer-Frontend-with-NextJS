'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Video, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  PlayCircle,
  FileText,
  Calendar,
  Award,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';

interface DrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}
const Drawer = ({ isOpen, onToggle }: DrawerProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: PlayCircle, label: 'Interview Practice', href: '/interview/prepare' },
    { icon: Video, label: 'Active Session', href: '/interview/session' },
    { icon: BarChart3, label: 'Results', href: '/interview/results' },
  ];

  const secondaryNavItems = [
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: FileText, label: 'Resume', href: '/resume' },
    { icon: Award, label: 'Achievements', href: '/achievements' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
  ];

  const handleLogout = () => {
    logout();
    // Force navigation to login page immediately after logout
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-17 left-3 h-[calc(100vh-6rem)] bg-white/40 backdrop-blur-md border border-amber-700/30 rounded-xl z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* User Profile */}
          <div className="p-3 border-b border-amber-700/20">
            {isOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <Image
                    src="/user.webp"
                    alt="User"
                    width={42}
                    height={42}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {user?.name || user?.firstname || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-stone-600 capitalize">
                    {user?.role || 'Free Plan'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg overflow-hidden mx-auto">
                <Image
                  src="/user.webp"
                  alt="User"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Main Navigation */}
            <div className="px-3">
              {isOpen && (
                <h3 className="px-3 text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">
                  Main
                </h3>
              )}
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${active 
                          ? 'bg-amber-100/70 text-amber-700 border-l-2 border-amber-700' 
                          : 'text-black hover:bg-white/50 hover:text-amber-800'
                        }
                        ${isOpen ? 'gap-3' : 'justify-center'}
                      `}
                      title={!isOpen ? item.label : undefined}
                    >
                      <Icon className={`${isOpen ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Divider */}
            <div className="my-6 mx-6 border-t border-amber-700/20"></div>

            {/* Secondary Navigation */}
            <div className="px-3">
              {isOpen && (
                <h3 className="px-3 text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">
                  More
                </h3>
              )}
              <nav className="space-y-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${active 
                          ? 'bg-amber-100/70 text-amber-700 border-l-2 border-amber-700' 
                          : 'text-black hover:bg-white/50 hover:text-amber-800'
                        }
                        ${isOpen ? 'gap-3' : 'justify-center'}
                      `}
                      title={!isOpen ? item.label : undefined}
                    >
                      <Icon className={`${isOpen ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-amber-700/20">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`
                w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors
                ${isOpen ? 'justify-start gap-3' : 'justify-center'}
              `}
              title={!isOpen ? 'Sign Out' : undefined}
            >
              <LogOut className={`${isOpen ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
              {isOpen && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;