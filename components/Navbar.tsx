
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
            <nav className="fixed top-4 left-4 right-4 z-50 bg-[#e1e1db]/80 backdrop-blur-xl border border-amber-700 rounded-2xl shadow-lg">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href ="/">
                    <div className="text-2xl font-bold text-black">
                        IntraViewer
                    </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-black hover:text-amber-700 hover:bg-amber-100">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-amber-700 hover:bg-amber-800 text-white shadow-md rounded-xl">
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
            <nav className="fixed top-4 left-4 right-4 z-40 bg-[#e1e1db]/80 backdrop-blur-xl border border-amber-700 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between px-6 py-3">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDrawer}
                            className="p-2 hover:bg-amber-100 rounded-lg"
                        >
                            <Menu className="w-5 h-5 text-black" />
                        </Button>
                        
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">IV</span>
                            </div>
                            <span className="font-bold text-black hidden sm:block">IntraViewer</span>
                        </Link>
                    </div>

                    {/* Center Section - Search */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search interviews, feedback, results..."
                                className="w-full pl-10 pr-4 py-2 border border-amber-700 rounded-full bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all text-black placeholder-black/50"
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Search Icon for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2 hover:bg-amber-100 rounded-lg"
                        >
                            <Search className="w-5 h-5 text-black" />
                        </Button>

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-amber-100 rounded-lg relative"
                        >
                            <Bell className="w-5 h-5 text-black" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>

                        {/* User Profile */}
                        <Link href={'./profile'}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center">
                                {user?.firstname && user?.lastname ? (
                                  <span className="text-white text-sm font-medium">
                                    {user.firstname?.[0]}{user.lastname?.[0]}
                                  </span>
                                ) : (
                                  <User className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-black hidden sm:block">
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

