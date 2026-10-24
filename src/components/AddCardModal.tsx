import React, { useState } from 'react';
import { useDeck } from '../context/DeckContext';

interface AddCardModalProps {
  isOpen: boolean;
  deckId: string;
  onClose: () => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, deckId, onClose }) => {
  const { addCard, decks } = useDeck();
  const deck = decks.find((d) => d.id === deckId);

  const [front, setFront] = useState('');
  const [frontSub, setFrontSub] = useState('');
  const [romaji, setRomaji] = useState('');
  const [back, setBack] = useState('');
  const [nuance, setNuance] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [sentenceJp, setSentenceJp] = useState('');
  const [sentenceEn, setSentenceEn] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    addCard({
      deckId,
      front: front.trim(),
      frontSub: frontSub.trim(),
      romaji: romaji.trim(),
      back: back.trim(),
      nuance: nuance.trim(),
      mnemonic: mnemonic.trim(),
      sentenceJp: sentenceJp.trim(),
      sentenceEn: sentenceEn.trim(),
      tag: deck?.badge || 'Core Vocab',
    });

    setFront('');
    setFrontSub('');
    setRomaji('');
    setBack('');
    setNuance('');
    setMnemonic('');
    setSentenceJp('');
    setSentenceEn('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-hidden border border-black/5 my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-[19px] font-bold text-black tracking-tight">Add New Flashcard</h2>
            <p className="text-[12px] text-slate-500">{deck?.title || 'Active Deck'}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Front Word / Term *
              </label>
              <input
                type="text"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="e.g. 乾杯 or Fitts's Law"
                required
                className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Reading / Furigana
              </label>
              <input
                type="text"
                value={frontSub}
                onChange={(e) => setFrontSub(e.target.value)}
                placeholder="e.g. かんぱい"
                className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Phonetic / Romaji
            </label>
            <input
              type="text"
              value={romaji}
              onChange={(e) => setRomaji(e.target.value)}
              placeholder="e.g. kanpai"
              className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              English Meaning / Definition *
            </label>
            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="e.g. Cheers, celebratory toast"
              required
              className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Usage Nuance & Grammar Context
            </label>
            <textarea
              rows={2}
              value={nuance}
              onChange={(e) => setNuance(e.target.value)}
              placeholder="e.g. Customary toast said before taking the first sip with friends or colleagues."
              className="w-full p-2.5 rounded-xl bg-[#F2F2F7] text-black text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Mnemonic Memory Hook
            </label>
            <input
              type="text"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="e.g. Dry (乾) up the cup (杯) together!"
              className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Example Sentence
              </label>
              <input
                type="text"
                value={sentenceJp}
                onChange={(e) => setSentenceJp(e.target.value)}
                placeholder="みんなで乾杯した。"
                className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Sentence Translation
              </label>
              <input
                type="text"
                value={sentenceEn}
                onChange={(e) => setSentenceEn(e.target.value)}
                placeholder="Everyone toasted together."
                className="w-full h-10 px-3 rounded-xl bg-[#F2F2F7] text-black text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full bg-slate-100 text-slate-700 text-[14px] font-medium hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!front.trim() || !back.trim()}
              className="flex-1 h-11 rounded-full bg-[#0A84FF] text-white text-[14px] font-semibold hover:bg-blue-600 disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-blue-500/25"
            >
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
