/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DeckProvider, useDeck } from './context/DeckContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { LibraryView } from './views/LibraryView';
import { DeckDetailView } from './views/DeckDetailView';
import { GeneratorView } from './views/GeneratorView';
import { SettingsView } from './views/SettingsView';
import { ActiveStudyModal } from './views/ActiveStudyModal';
import { LiveVoiceCoachModal } from './views/LiveVoiceCoachModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('library');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const {
    activeStudyDeckId,
    closeStudyMode,
    openStudyMode,
    activeVoiceCoachDeckId,
    closeVoiceCoach,
    openVoiceCoach,
    decks,
  } = useDeck();

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'voice-coach') {
      openVoiceCoach(selectedDeckId || decks[0]?.id || 'deck_japanese');
    } else {
      setSelectedDeckId(null);
    }
  };

  const getHeaderTitle = () => {
    if (activeTab === 'generator') return 'Generator';
    if (activeTab === 'settings') return 'Settings';
    if (selectedDeckId) {
      const d = decks.find((deck) => deck.id === selectedDeckId);
      return d ? d.title : 'Library';
    }
    return 'Library';
  };

  return (
    <div className="bg-[#F2F2F7] min-h-screen text-[#1a1b1f] flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        title={getHeaderTitle()}
        onProfileClick={() => {
          setActiveTab('settings');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 px-4 bg-[#F2F2F7] min-h-screen max-w-lg mx-auto">
        {activeTab === 'library' && (
          <>
            {selectedDeckId ? (
              <DeckDetailView
                deckId={selectedDeckId}
                onBack={() => setSelectedDeckId(null)}
              />
            ) : (
              <LibraryView
                onSelectDeck={(id) => {
                  setSelectedDeckId(id);
                }}
              />
            )}
          </>
        )}

        {activeTab === 'generator' && <GeneratorView />}

        {activeTab === 'voice-coach' && (
          <div className="flex flex-col items-center justify-center p-8 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#0A84FF] text-white flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
              <span className="material-symbols-outlined text-[32px]">graphic_eq</span>
            </div>
            <h2 className="text-[22px] font-bold text-black mb-1">Ambient Voice Recall</h2>
            <p className="text-[14px] text-slate-500 max-w-xs mb-6">
              Hands-free, real-time speech recall session powered by Whisper on-device ML.
            </p>
            <button
              onClick={() => openVoiceCoach(selectedDeckId || decks[0]?.id)}
              type="button"
              className="px-8 py-3 rounded-full bg-[#0A84FF] text-white text-[15px] font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
            >
              Start Call Session
            </button>
          </div>
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Persistent Bottom Tab Bar */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Full-Screen Study Modal */}
      {activeStudyDeckId && (
        <ActiveStudyModal
          deckId={activeStudyDeckId}
          onClose={closeStudyMode}
          onOpenVoiceCoach={(id) => {
            closeStudyMode();
            openVoiceCoach(id);
          }}
        />
      )}

      {/* Full-Screen Live Voice Coach Modal */}
      {activeVoiceCoachDeckId && (
        <LiveVoiceCoachModal
          deckId={activeVoiceCoachDeckId}
          onClose={closeVoiceCoach}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DeckProvider>
      <AppContent />
    </DeckProvider>
  );
}
