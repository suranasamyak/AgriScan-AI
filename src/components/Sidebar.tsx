import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  MapPin,
  Clock3,
  CloudRain,
  ShieldAlert,
  Bot,
  Users,
  History,
  BarChart3,
  Settings,
  Leaf,
  WifiOff,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavItem =
  | 'dashboard'
  | 'scanner'
  | 'live_tracking'
  | 'timeline'
  | 'risk'
  | 'treatment'
  | 'assistant'
  | 'community'
  | 'history'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentNav: NavItem;
  onSelectNav: (item: NavItem) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onSelectNav,
  isOpenMobile,
  onCloseMobile
}) => {
  const { t, isOnline, pendingSyncCount, syncPendingQueue, isDemoMode } = useApp();

  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'scanner', label: t('crop_scanner'), icon: <ScanLine className="w-5 h-5" />, badge: 'AI Vision' },
    { id: 'live_tracking', label: t('live_tracking'), icon: <MapPin className="w-5 h-5" />, badge: 'GPS Map' },
    { id: 'timeline', label: t('health_timeline'), icon: <Clock3 className="w-5 h-5" /> },
    { id: 'risk', label: t('risk_forecast'), icon: <CloudRain className="w-5 h-5" /> },
    { id: 'treatment', label: t('treatment_advisor'), icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'assistant', label: t('farmer_assistant'), icon: <Bot className="w-5 h-5" />, badge: 'Gemini' },
    { id: 'community', label: t('community_alerts'), icon: <Users className="w-5 h-5" /> },
    { id: 'history', label: t('scan_history'), icon: <History className="w-5 h-5" /> },
    { id: 'reports', label: t('reports'), icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#143324] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-950/60 shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-800/40 bg-[#0f281c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-[#0f281c]">
              <Leaf className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">AgroScan AI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 font-medium">Detect • Track • Protect</p>
            </div>
          </div>
          {isDemoMode && (
            <div className="mt-3 py-1 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                DEMO MODE ACTIVE
              </span>
              <span className="text-[10px] text-amber-200/70">Judge View</span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNav(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950 font-semibold'
                    : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-emerald-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-800/60 text-emerald-200 border border-emerald-700/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Network & Offline Status Banner */}
        <div className="p-3 border-t border-emerald-900/60 bg-[#0d2319]">
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/80 flex items-center gap-1.5 font-medium">
                {isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                )}
                {isOnline ? 'Online Synced' : 'Offline Mode'}
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono">SQLite Local</span>
            </div>

            {pendingSyncCount > 0 && (
              <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between">
                <span className="text-[11px] text-amber-300">
                  {pendingSyncCount} queued action(s)
                </span>
                <button
                  onClick={syncPendingQueue}
                  disabled={!isOnline}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
