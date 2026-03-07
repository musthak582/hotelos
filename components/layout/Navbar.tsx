"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";

interface NavbarProps {
  hotelName?: string;
}

export function Navbar({ hotelName }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? "";

  return (
    <>
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/[0.06] fixed top-0 right-0 left-0 lg:left-[240px] z-20 flex items-center px-4 lg:px-6 gap-4">

        {/* Mobile menu */}
        <button
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 h-9 cursor-pointer hover:border-white/20 transition-colors group">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-500 group-hover:text-slate-400 flex-1">
              Search...
            </span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-600 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-none mb-0.5">
                  {userName.split(" ")[0]}
                </p>
                <p className="text-[11px] text-slate-500 leading-none">Owner</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden"
                  >
                    {/* User info */}
                    <div className="px-3.5 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <button
                        onClick={() => { router.push("/settings"); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => { router.push("/settings"); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                    </div>

                    <div className="p-1.5 border-t border-white/[0.06]">
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        hotelName={hotelName}
      />
    </>
  );
}