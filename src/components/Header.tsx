import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Globe,
  User as UserIcon,
  PlusCircle,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  LogOut,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewScan: () => void;
  onOpenNewField: () => void;
  currentTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewScan,
  onOpenNewField,
  currentTitle
}) => {
  const { user, language, setLanguage, fields, activeField, setActiveField, alerts, isDemoMode, setIsDemoMode } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.readAt);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-shadow">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-xl lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {currentTitle}
              {isDemoMode && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  DEMO DATA
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">AgroScan AI • Intelligent Crop Health System</p>
          </div>
        </div>

        {/* Center: Active Field Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 text-xs">
          <MapPin className="w-4 h-4 text-emerald-700 ml-1.5" />
          <span className="text-slate-500 font-medium">Active Field:</span>
          {fields.length > 0 ? (
            <select
              value={activeField?.id || ''}
              onChange={(e) => {
                const found = fields.find(f => f.id === e.target.value);
                if (found) setActiveField(found);
              }}
              className="bg-transparent font-semibold text-slate-800 pr-3 focus:outline-none cursor-pointer"
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.cropType} • {f.area} ac)
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={onOpenNewField}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              + Register First Field
            </button>
          )}
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Scan Button */}
          <button
            onClick={onOpenNewScan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span className="hidden sm:inline">Start AI Scan</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                      language === l.code ? 'font-bold text-emerald-800 bg-emerald-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLangMenu(false);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Crop Health Alerts</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {alerts.length} Total
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No active alerts. All fields operating safely.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="py-2.5 flex items-start gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg mt-0.5 ${
                            alert.severity === 'critical' || alert.severity === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {alert.severity === 'critical' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 font-medium leading-snug">{alert.message}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowLangMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                {user?.displayName ? user.displayName.charAt(0) : 'R'}
              </div>
              <span className="text-xs font-semibold hidden md:inline max-w-[120px] truncate">
                {user?.displayName || 'Farmer Ramesh'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="pb-3 border-b border-slate-100">
                  <p className="font-bold text-sm text-slate-900">{user?.displayName || 'Ramesh Patil'}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">{user?.email || 'farmer_ramesh@agroscan.in'}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                    <span>Verified Krishi Profile (Nashik, MH)</span>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsDemoMode(!isDemoMode);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Toggle Demo Mode</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDemoMode ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-200 text-slate-600'}`}>
                      {isDemoMode ? 'ENABLED' : 'OFF'}
                    </span>
                  </button>

                  <button
                    onClick={onOpenNewField}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    Register New Field
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
