import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { FieldModal } from './components/FieldModal';
import { Dashboard } from './pages/Dashboard';
import { CropScanner } from './pages/CropScanner';
import { LiveTracking } from './pages/LiveTracking';
import { Timeline } from './pages/Timeline';
import { RiskForecast } from './pages/RiskForecast';
import { TreatmentAdvisor } from './pages/TreatmentAdvisor';
import { FarmerAssistant } from './pages/FarmerAssistant';
import { CommunityAlerts } from './pages/CommunityAlerts';
import { ScanHistory } from './pages/ScanHistory';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { t } = useApp();
  const [currentNav, setCurrentNav] = useState<NavItem>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  const handleOpenNewScan = () => {
    setCurrentNav('scanner');
  };

  const handleOpenNewField = () => {
    setIsFieldModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Sidebar navigation */}
      <Sidebar
        currentNav={currentNav}
        onSelectNav={(item) => setCurrentNav(item)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          currentTitle={t(`nav_title_${currentNav}`)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewScan={handleOpenNewScan}
          onOpenNewField={handleOpenNewField}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentNav === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setCurrentNav(tab)}
              onOpenNewScan={handleOpenNewScan}
              onOpenNewField={handleOpenNewField}
            />
          )}
          {currentNav === 'scanner' && (
            <CropScanner onNavigate={(tab) => setCurrentNav(tab)} />
          )}
          {currentNav === 'live_tracking' && (
            <LiveTracking onOpenNewField={handleOpenNewField} />
          )}
          {currentNav === 'timeline' && (
            <Timeline onOpenNewScan={handleOpenNewScan} />
          )}
          {currentNav === 'risk' && <RiskForecast />}
          {currentNav === 'treatment' && <TreatmentAdvisor />}
          {currentNav === 'assistant' && <FarmerAssistant />}
          {currentNav === 'community' && <CommunityAlerts />}
          {currentNav === 'history' && <ScanHistory />}
          {currentNav === 'reports' && <Reports />}
          {currentNav === 'settings' && <Settings />}
        </main>
      </div>

      {/* Field Registration Modal */}
      <FieldModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
