import React, { useState } from 'react';
import { DeckCategory } from '../types';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (deck: { title: string; description: string; category: DeckCategory }) => void;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DeckCategory>('Language');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim() || 'Custom flashcard deck',
      category,
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  const categories: DeckCategory[] = ['Language', 'Design', 'Science', 'Tech'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden border border-black/5 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-[19px] font-bold text-black tracking-tight">Create New Deck</h2>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Deck Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Japanese Kanji N2, Microservices..."
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] text-black text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Core Vocabulary & Grammar"
              className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] text-black text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-[13px] font-medium border transition-colors ${
                    category === cat
                      ? 'bg-[#0A84FF] text-white border-[#0A84FF] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full bg-slate-100 text-slate-700 text-[14px] font-medium hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 h-11 rounded-full bg-[#0A84FF] text-white text-[14px] font-semibold hover:bg-blue-600 disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-blue-500/25"
            >
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
