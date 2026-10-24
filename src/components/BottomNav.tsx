import React from 'react';

export type NavTab = 'library' | 'generator' | 'voice-coach' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'library' as NavTab, label: 'Library', icon: 'style' },
    { id: 'generator' as NavTab, label: 'Generator', icon: 'auto_awesome' },
    { id: 'voice-coach' as NavTab, label: 'Voice Coach', icon: 'graphic_eq' },
    { id: 'settings' as NavTab, label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-white/85 backdrop-blur-xl border-t border-black/5">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              type="button"
              className={`flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 transition-colors ${
                isActive ? 'text-[#005ab3] font-semibold' : 'text-[#414754] hover:text-[#005ab3]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="text-[12px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="w-full flex justify-center pb-2 pt-1 pointer-events-none">
        <div className="w-36 h-1 rounded-full bg-black/20" />
      </div>
    </nav>
  );
};
