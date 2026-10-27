'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { FDRRepositoryView } from '@/components/FDRRepositoryView';
import { ReleasesView } from '@/components/ReleasesView';
import { AuditTrailView } from '@/components/AuditTrailView';
import { SettingsView } from '@/components/SettingsView';
import { FDRDetailModal } from '@/components/FDRDetailModal';
import { NewFDRModal } from '@/components/NewFDRModal';
import { RenewalModal } from '@/components/RenewalModal';
import { ReleaseWorkflowModal } from '@/components/ReleaseWorkflowModal';

function MainPortalContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [isNewFdrModalOpen, setIsNewFdrModalOpen] = useState(false);
  const [renewalInstrumentId, setRenewalInstrumentId] = useState<string | null>(null);
  const [releaseInstrumentId, setReleaseInstrumentId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectInstrument={(id) => setSelectedInstrumentId(id)}
            onOpenNewFdrModal={() => setIsNewFdrModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'repository' && (
          <FDRRepositoryView
            onSelectInstrument={(id) => setSelectedInstrumentId(id)}
            onOpenNewFdrModal={() => setIsNewFdrModalOpen(true)}
          />
        )}

        {activeTab === 'releases' && (
          <ReleasesView onOpenReleaseModal={(id) => setReleaseInstrumentId(id)} />
        )}

        {activeTab === 'audit' && <AuditTrailView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">
              AICTE FDR &amp; Security Deposit Management Portal
            </span>
            <span>•</span>
            <span>All India Council for Technical Education, New Delhi</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Security Guarantee Monitoring</span>
            <span>•</span>
            <span>CAG Audit Compliant</span>
            <span>•</span>
            <span>Core Banking Gateway</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedInstrumentId && (
        <FDRDetailModal
          instrumentId={selectedInstrumentId}
          onClose={() => setSelectedInstrumentId(null)}
          onOpenRenewalModal={(id) => {
            setSelectedInstrumentId(null);
            setRenewalInstrumentId(id);
          }}
          onOpenReleaseModal={(id) => {
            setSelectedInstrumentId(null);
            setReleaseInstrumentId(id);
          }}
        />
      )}

      {isNewFdrModalOpen && (
        <NewFDRModal
          isOpen={isNewFdrModalOpen}
          onClose={() => setIsNewFdrModalOpen(false)}
          onSuccess={(newId) => {
            setSelectedInstrumentId(newId);
          }}
        />
      )}

      {renewalInstrumentId && (
        <RenewalModal
          instrumentId={renewalInstrumentId}
          onClose={() => setRenewalInstrumentId(null)}
          onSuccess={(newId) => setSelectedInstrumentId(newId)}
        />
      )}

      {releaseInstrumentId && (
        <ReleaseWorkflowModal
          instrumentId={releaseInstrumentId}
          onClose={() => setReleaseInstrumentId(null)}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainPortalContent />
    </AppProvider>
  );
}
