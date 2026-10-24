import React from 'react';

interface HeaderProps {
  title?: string;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Library', onProfileClick }) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-[#F2F2F7]/85 backdrop-blur-xl border-b border-black/5 pt-safe">
      <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#005ab3] text-[24px]">style</span>
          <h1 className="font-semibold text-[17px] text-[#1a1b1f] tracking-tight">{title}</h1>
        </div>
        <button
          onClick={onProfileClick}
          aria-label="User Profile"
          type="button"
          className="w-8 h-8 rounded-full bg-[#005ab3] flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-white text-[18px]">person</span>
        </button>
      </div>
    </header>
  );
};
