
'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuthStore } from "@/lib/stores/authStore";
import { Menu, Bell, Search, User } from "lucide-react";
import Drawer from "./Drawer";

interface NavbarProps {
  onDrawerStateChange?: (isOpen: boolean) => void;
}

const Navbar = ({ onDrawerStateChange }: NavbarProps) => {
    const { isAuthenticated, user } = useAuthStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize drawer state based on screen size only once
    useEffect(() => {
        if (!isInitialized) {
            // const isDesktop = window.innerWidth >= 1024; // lg breakpoint
            // setIsDrawerOpen(isDesktop);
            // onDrawerStateChange?.(isDesktop);
            setIsInitialized(true);
        }
    }, [onDrawerStateChange, isInitialized]);

    const toggleDrawer = () => {
        const newState = !isDrawerOpen;
        setIsDrawerOpen(newState);
        onDrawerStateChange?.(newState);
    };
   
    if (!isAuthenticated) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-200 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        IntraViewer
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-sky-50">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-md">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }
    else{
    return (
        <>
            {/* Authenticated Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-sky-200 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDrawer}
                            className="p-2 hover:bg-sky-50"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </Button>
                        
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">IV</span>
                            </div>
                            <span className="font-bold text-slate-800 hidden sm:block">IntraViewer</span>
                        </Link>
                    </div>

                    {/* Center Section - Search */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search interviews, feedback, results..."
                                className="w-full pl-10 pr-4 py-2 border border-sky-200 rounded-full bg-sky-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Search Icon for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2 hover:bg-gray-100"
                        >
                            <Search className="w-5 h-5 text-gray-600" />
                        </Button>

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-gray-100 relative"
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>

                        {/* User Profile */}
                        <Link href={'./profile'}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full flex items-center justify-center">
                                {user?.firstname && user?.lastname ? (
                                  <span className="text-white text-sm font-medium">
                                    {user.firstname?.[0]}{user.lastname?.[0]}
                                  </span>
                                ) : (
                                  <User className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user?.name || user?.firstname || user?.email?.split('@')[0] || 'User'}
                            </span>
                        </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Drawer Component */}
            <Drawer isOpen={isDrawerOpen} onToggle={toggleDrawer} />
        </>
    );
};
}

export default Navbar;

