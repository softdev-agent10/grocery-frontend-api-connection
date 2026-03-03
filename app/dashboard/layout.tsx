"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Wrench, 
  Settings, 
  HelpCircle, 
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  Search,
  Bell,
  RotateCw,
  Maximize,
  User,
  LogOut,
  UserCircle,
  HeartPlus
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // States
  const [isOpen, setIsOpen] = useState(false); // Mobile Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop Sidebar Collapse
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile Dropdown
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Sidebar Dropdown States
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    inventory: false,
    tools: false,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle Function for Sidebar Menus
  const toggleMenu = (menu: string) => {
    if (isCollapsed) setIsCollapsed(false); 
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Real-time Clock logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close profile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleRefresh = () => window.location.reload();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] font-sans text-gray-900">
      
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-64"}
      `}>
        {/* Sidebar Logo Section */}
        <div className={`p-6  flex items-center border-b border-gray-200 flex-shrink-0 ${isCollapsed ? "justify-center px-2" : "justify-between"}`}>
          <div className="flex items-center gap-2 group cursor-pointer overflow-hidden"> 
            {/* <div className="overflow-hidden rounded-lg flex-shrink-0 transition-transform group-hover:scale-105 duration-300 justify-center">
              <img 
                src="https://i.postimg.cc/tgHH0cwY/1.png" 
                alt="Logo" 
                className="w-12 h-8 object-contain " 
              />
            </div> */}
              {!isCollapsed && (
              <span className="font-bold text-[25px] tracking-tight italic text-gray-800  group-hover:text-blue-600 transition-colors whitespace-nowrap">
               OneBalance
              </span>
            )}  
           </div> 
          
          {/* Collapse Toggle Button (Desktop) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors ml-2"
          >
            {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>

          {/* Close Button (Mobile) */}
          <button className="lg:hidden p-1 hover:bg-gray-100 rounded-md" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          
          {/* Dashboard Link */}
          <div className={`flex items-center gap-3 px-3 py-2.5 text-blue-600 bg-blue-50 rounded-lg cursor-pointer font-semibold text-sm transition-all border border-blue-100 ${isCollapsed ? "justify-center" : ""}`}>
            <LayoutDashboard size={20} className="flex-shrink-0" /> 
            {!isCollapsed && <span>Dashboard</span>}
          </div>

        {/* Sales */}
        <a 
          href="/sales" 
          rel="noopener noreferrer"
          className="block"
        >
          <div className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg cursor-pointer transition-all group ${isCollapsed ? "justify-center" : ""}`}>
            <ShoppingBag size={20} className="flex-shrink-0" /> 
            {!isCollapsed && <span className="text-sm font-medium">Sales</span>}
          </div>
        </a>

          {/* INVENTORY */}
          <div>
            <button 
              onClick={() => toggleMenu('inventory')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${openMenus.inventory ? 'bg-gray-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'} ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Package size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Inventory</span>}
              </div>
              {!isCollapsed && <ChevronDown size={18} className={`transition-transform duration-200 ${openMenus.inventory ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />}
            </button>
            
            {!isCollapsed && openMenus.inventory && (
              <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                {["View Product", "Categories", "Top Selling Product", "Out of Stocks", "Low Stocks", "Unit", "Brands", "Tax Fee", "Warranties"].map((sub) => (
                  <div key={sub} className="px-3 py-2 text-[13px] text-gray-500 hover:text-blue-600 cursor-pointer rounded-md hover:bg-blue-50/50 transition-colors">
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOOLS */}
          <div>
            <button 
              onClick={() => toggleMenu('tools')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${openMenus.tools ? 'bg-gray-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'} ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Wrench size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Tools</span>}
              </div>
              {!isCollapsed && <ChevronDown size={18} className={`transition-transform duration-200 ${openMenus.tools ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />}
            </button>
            
            {!isCollapsed && openMenus.tools && (
              <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                {["Cash In", "Cash Out", "Customer Accounts", "Gift Card", "Loyalty Card", "Open Cash Drawer", "Membership Card", "Promotion"].map((sub) => (
                  <div key={sub} className="px-3 py-2 text-[13px] text-gray-500 hover:text-blue-600 cursor-pointer rounded-md hover:bg-blue-50/50 transition-colors">
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

         
            <div className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg cursor-pointer transition-all group ${isCollapsed ? "justify-center" : ""}`}>
              <Settings size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
            </div>
           

         
            
            <div className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg cursor-pointer transition-all group ${isCollapsed ? "justify-center" : ""}`}>
              <HelpCircle size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Helps</span>}
            </div>
           
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* NAVBAR */}
        <nav className="bg-slate-100 border-b border-gray-200 px-6 h-20 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Menu size={20} className="text-gray-600" />
            </button>
            
            <div className="hidden md:flex items-center bg-gray-50 px-3 py-2 rounded-lg w-full max-w-sm group border border-gray-100 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <Search size={16} className="text-gray-400 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-gray-400" 
              />
            </div>

            <div className="hidden sm:flex flex-col items-end px-3 border-r border-gray-100 mr-2">
              <span className="text-xl font-bold text-gray-700 tabular-nums leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1 text-right">
                {currentTime.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-all">
              <RotateCw size={20} />
            </button>
            <button onClick={toggleFullScreen} className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-all">
              <Maximize size={20} />
            </button>
            <div className="relative">
              <button className="p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>

            {/* PROFILE */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-3 border-l border-gray-100 cursor-pointer group"
              >
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Imran Nazir</span>
                  <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                  </span>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${isProfileOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                  <User size={18} />
                </div>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1 text-left">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Super Admin</p>
                    <p className="text-sm font-bold text-gray-800">imran@gmail.com</p>
                  </div>
                  <div className="px-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all text-left">
                      <UserCircle size={18} /> <span>My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all text-left mt-1">
                      <LogOut size={17} /> <span className="font-bold">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div> 
          </div>
        </nav>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
// ami chacci je code gula dashboard er maje component then folder er maje sajiye thakbe..erokom akare ekta sundor stucture banaia deo and code gula stucture onujayi diye deo sob thkbe dashboard er moddhe dashboard er maje layout.tsx page.tsx ase tasara project setup kora ase 
// full responsive for volcora register display: 1920*1080
//  volcora customer display : 220*1440 and nest hub,nest hub max er jonno responsive kore full code deo