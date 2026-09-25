import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Search, Bell, Menu, X } from 'lucide-react';
import { geocodeAddress } from '../utils/geoUtils';

export default function Header({ onSearchLocation, onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    if (onShowToast) onShowToast({ type: 'info', message: `Searching map for "${searchQuery}"...` });

    try {
      const results = await geocodeAddress(searchQuery);

      if (results && results.length > 0) {
        const { lat, lon, shortName } = results[0];

        if (onSearchLocation) {
          onSearchLocation([lat, lon], shortName);
        }
        if (onShowToast) {
          onShowToast({ type: 'success', message: `Located ${shortName} on map!` });
        }
        navigate('/');
      } else {
        if (onShowToast) {
          onShowToast({ type: 'error', message: `No coordinates found for "${searchQuery}".` });
        }
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast({ type: 'error', message: 'Geocoding request failed. Check internet connection.' });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Navigate', path: '/navigate' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Community', path: '/community' },
    { label: 'About', path: '/about' }
  ];

  return (
    <header className="relative z-[1000] mx-4 sm:mx-8 mt-5 pointer-events-none">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 ease-premium pointer-events-auto">
        
        {/* Left: Logo & Brand */}
        <NavLink
          to="/"
          tabIndex={0}
          aria-label="CityPulse Home"
          className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full outline-none transition-all duration-300 ease-premium hover:-translate-y-1 hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight">CityPulse</span>
            <span className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase -mt-0.5">Jaipur Live</span>
          </div>
        </NavLink>

        {/* Center: Nav Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/30">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              tabIndex={0}
              className={({ isActive }) =>
                `px-4 py-2 text-[11px] font-semibold rounded-lg transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Functional Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-slate-50/80 hover:bg-white/90 rounded-xl border border-slate-200/50 text-xs text-slate-500 transition-all duration-300 w-44 md:w-56 focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-300/50 focus-within:bg-white pointer-events-auto relative z-[1100]"
          >
            <Search className={`w-3.5 h-3.5 flex-shrink-0 ${isSearching ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Jaipur area..."
              tabIndex={0}
              aria-label="Search Jaipur area or landmark"
              className="w-full bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-[11px] font-medium truncate"
            />
            <button
              type="submit"
              tabIndex={0}
              disabled={isSearching}
              className="hidden md:inline text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm hover:bg-blue-50 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-300 ease-premium active:scale-95"
            >
              Locate
            </button>
          </form>

          {/* Notification Bell */}
          <button
            onClick={() => {
              if (onShowToast) onShowToast({ type: 'info', message: 'Notifications: 1 Active Waterlogging Alert in MI Road Sector 2.' });
            }}
            tabIndex={0}
            aria-label="View Notifications"
            className="relative w-10 h-10 rounded-xl bg-white/80 hover:bg-white border border-slate-200/50 flex items-center justify-center text-slate-500 shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-glow-pulse"></span>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => {
              if (onShowToast) onShowToast({ type: 'info', message: 'Logged in as Admin: AK (Jaipur Municipal Command)' });
            }}
            tabIndex={0}
            aria-label="User Profile AK"
            className="relative cursor-pointer group focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl outline-none transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl ring-2 ring-blue-500/15 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden border border-white/80 shadow-sm">
              <span className="text-xs font-extrabold text-blue-700">AK</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            tabIndex={0}
            aria-label="Toggle Mobile Menu"
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all duration-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Nav Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-4 bg-white/80 backdrop-blur-3xl saturate-[1.5] rounded-2xl border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-2 pointer-events-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              tabIndex={0}
              className={({ isActive }) =>
                `px-4 py-2.5 text-[11px] font-semibold rounded-xl text-left transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100/80'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
