import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "./AuthContext";
import { 
  LayoutDashboard, 
  DollarSign, 
  Image, 
  Star, 
  Settings, 
  LogOut, 
  Crown, 
  Menu, 
  X,
  Globe,
  ReceiptText
} from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out of the Admin panel?")) {
      await signOut(auth);
      navigate("/admin/login");
    }
  };

  // Resolve current active heading
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith("/pricing")) return "Rates & Pricing Config";
    if (path.endsWith("/gallery")) return "Media Showcase Gallery";
    if (path.endsWith("/reviews")) return "Reviews & Testimonials";
    if (path.endsWith("/billing")) return "Invoicing & Billing";
    if (path.endsWith("/settings")) return "General Settings Metadata";
    return "Management Dashboard";
  };

  const navItems = [
    { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
    { to: "/admin/pricing", end: false, label: "Rates & Pricing", icon: DollarSign },
    { to: "/admin/gallery", end: false, label: "Showcase Gallery", icon: Image },
    { to: "/admin/reviews", end: false, label: "Moderate Reviews", icon: Star },
    { to: "/admin/billing", end: false, label: "Billing Console", icon: ReceiptText },
    { to: "/admin/settings", end: false, label: "General Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#FAF6EE] flex flex-col md:flex-row relative font-sans">
      
      {/* Off-canvas Background Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, transparent 80%)" }}
      />

      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#141B26] border-b border-[#C9A84C]/20 z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <span className="font-serif font-bold text-[#F0D080] tracking-tight text-base" style={{ fontFamily: "Georgia, serif" }}>
            KINGS DIAMONDS
          </span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 border border-[#C9A84C]/20 text-[#FAF6EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Left Navigation Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#141B26] border-r border-[#C9A84C]/25 flex flex-col justify-between p-6 z-50 transition-transform duration-350 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          
          {/* Sidebar Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-[#C9A84C]/10 rounded-full flex items-center justify-center border border-[#C9A84C]/20 mb-3 shadow-[0_0_15px_rgba(201,168,76,0.15)]">
              <Crown className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#F0D080] tracking-tight leading-none" style={{ fontFamily: "Georgia, serif" }}>
              Kings Diamonds
            </h2>
            <span className="text-[9px] tracking-[0.25em] font-semibold text-[#FAF6EE]/50 uppercase mt-1.5 block">
              Villas · Lonavala
            </span>
            <div className="h-[1px] w-12 bg-[#C9A84C]/15 mt-3" />
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-2.5">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all group border whitespace-nowrap
                    ${isActive 
                      ? "bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D1117] border-[#C9A84C] shadow-lg shadow-[#C9A84C]/5" 
                      : "bg-transparent text-[#FAF6EE]/70 border-transparent hover:text-white hover:bg-[#FAF6EE]/5 hover:border-[#C9A84C]/10"
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 shrink-0 transition-all group-hover:scale-110" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer details */}
        <div className="space-y-5 border-t border-[#C9A84C]/10 pt-4 mt-6">
          
          {/* User profile identifier */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#C9A84C]">A</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-[#FAF6EE]/40 font-bold uppercase tracking-wider block">Administrator</p>
              <p className="text-xs text-white/90 font-medium truncate font-mono">
                {user?.email || "admin@kingsvillas.com"}
              </p>
            </div>
          </div>

          {/* Log out option */}
          <button
            onClick={handleSignOut}
            className="w-full border border-red-500/15 bg-red-500/5 hover:bg-red-500 hover:text-[#0D1117] hover:border-red-500 text-red-500 text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-11 shrink-0"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>

        </div>
      </aside>

      {/* Main Content Scaffold Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-[#C9A84C]/15 bg-[#141B26]/35 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#C9A84C]/10 text-[#C9A84C] font-bold py-1 px-2.5 rounded-md uppercase tracking-widest font-mono">
              Live Console
            </span>
            <div className="text-xs text-[#FAF6EE]/45 flex items-center gap-1.5 pl-3 border-l border-[#C9A84C]/15 font-serif italic">
              Editing: {getPageTitle()}
            </div>
          </div>
          <div>
            <Link
              to="/"
              className="text-xs font-bold text-[#FAF6EE]/75 hover:text-[#C9A84C] transition-all flex items-center gap-1.5 p-1.5 px-3 rounded-lg border border-[#C9A84C]/10 hover:border-[#C9A84C]/35 bg-[#0D1117]/40"
            >
              <Globe className="w-3.5 h-3.5" />
              Return to Website
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Content Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
