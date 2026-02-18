
'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
            <nav className="fixed top-0.2 left-4 right-4 z-50 bg-white/40 backdrop-blur-md border border-amber-700/30 rounded-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/intraviewerlogo.png"
                            alt="IntraViewer Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg"
                            priority
                        />
                        <span className="text-2xl font-bold text-black">IntraViewer</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-black hover:text-amber-700 hover:bg-amber-100/50 rounded-lg">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-amber-700/90 hover:bg-amber-700 text-white rounded-lg border border-amber-600/50">
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
            <nav className="fixed top-0.2 left-3 right-3 z-40 bg-white/40 backdrop-blur-md border border-amber-700/30 rounded-xl">
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
                            <Image
                                src="/intraviewerlogo.png"
                                alt="IntraViewer Logo"
                                width={42}
                                height={42}
                                className="w-8 h-8 rounded-lg"
                                priority
                            />
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
                                className="w-full pl-10 pr-4 py-2 border border-amber-700/30 rounded-lg bg-white/50 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 transition-all text-black placeholder-black/40"
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
                            <div className="w-8 h-8 rounded-lg overflow-hidden">
                                <Image
                                    src="/user.webp"
                                    alt="User"
                                    width={42}
                                    height={42}
                                    className="w-full h-full object-cover"
                                />
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

