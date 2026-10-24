import React, { useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { speakText, triggerHaptic } from '../services/speechService';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDefaults } = useDeck();

  const [activeModel, setActiveModel] = useState(settings.activeModel);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadedVoices, setDownloadedVoices] = useState<Set<string>>(new Set(['Kenji', 'Daiki']));
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);

  const handleToggleWhisper = () => {
    triggerHaptic(settings.hapticAudio);
    updateSettings({ offlineWhisper: !settings.offlineWhisper });
  };

  const handleToggleHaptic = () => {
    triggerHaptic(!settings.hapticAudio);
    updateSettings({ hapticAudio: !settings.hapticAudio });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateSettings({ speechRate: val });
  };

  const getRateLabel = (val: number) => {
    const fixed = val.toFixed(2);
    if (val < 0.9) return `${fixed}x (Slow Study)`;
    if (val > 1.2) return `${fixed}x (Fast Drill)`;
    return `${fixed}x (Natural)`;
  };

  const handleTestVoice = async (voiceName: string, sampleText: string) => {
    setTestingVoice(voiceName);
    triggerHaptic(settings.hapticAudio);
    await speakText(sampleText, settings.speechRate, voiceName);
    setTestingVoice(null);
  };

  const handleDownloadVoice = (voiceName: string) => {
    triggerHaptic(settings.hapticAudio);
    setDownloadedVoices((prev) => new Set([...prev, voiceName]));
  };

  const handleDownloadModel = (modelName: string) => {
    setDownloadingModel(modelName);
    triggerHaptic(settings.hapticAudio);
    setTimeout(() => {
      setDownloadingModel(null);
      setActiveModel(modelName);
      updateSettings({ activeModel: modelName });
    }, 1500);
  };

  const handleResetData = () => {
    if (confirm('Reset all decks, cards, and study stats to factory defaults?')) {
      resetDefaults();
      setResetSuccessToast(true);
      setTimeout(() => setResetSuccessToast(false), 2500);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 max-w-lg mx-auto">
      {/* Toast Notification */}
      {resetSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black text-white text-[13px] font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[#34C759] text-[18px]">check_circle</span>
          <span>Reset to default library data!</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col pt-3 pb-4">
        <span className="text-[12px] uppercase tracking-wider text-[#717786] font-semibold mb-1">
          Device & Intelligence
        </span>
        <h1 className="text-[28px] font-bold text-black tracking-tight">Local Models & Settings</h1>
      </header>

      {/* Storage & Hardware Diagnostic Hero Surface */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-3 border border-black/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
            </div>
            <span className="text-[13px] font-semibold text-black">On-Device Neural Engine</span>
          </div>
          <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0c006b]">
            ANE Gen 3
          </span>
        </div>

        {/* Segmented Storage Meter */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[12px] text-[#8E8E93]">
            <span>
              Storage Used: <strong className="text-black font-semibold">5.6 GB</strong> of 128 GB
            </span>
            <span>4.3% Capacity</span>
          </div>

          <div className="h-2 w-full rounded-full bg-[#eeedf3] overflow-hidden flex">
            <div className="h-full bg-[#005ab3]" style={{ width: '68%' }} title="AI Models (4.2 GB)" />
            <div className="h-full bg-[#6462ec]" style={{ width: '14%' }} title="Voices (790 MB)" />
            <div className="h-full bg-[#FF9F0A]" style={{ width: '8%' }} title="Audio Cache (320 MB)" />
            <div className="h-full bg-[#dad9df]" style={{ width: '10%' }} title="Other App Data" />
          </div>

          <div className="flex items-center gap-3 pt-0.5 text-[12px] text-[#8E8E93] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#005ab3] inline-block" />
              <span>LLM (4.2 GB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6462ec] inline-block" />
              <span>TTS (790 MB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF9F0A] inline-block" />
              <span>Cache (320 MB)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: AI VOICE ENGINE */}
      <section className="flex flex-col mb-6">
        <div className="px-2 pb-1.5">
          <span className="text-[12px] font-semibold tracking-wider text-[#717786] uppercase">
            AI Voice Engine
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-black/5">
          {/* Row 1: Active Model */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4a47d2] to-[#0073e0] flex items-center justify-center shrink-0 shadow-sm text-white">
                  <span className="material-symbols-outlined text-[22px]">memory</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[17px] font-semibold text-black truncate">Llama-3-8B-Instruct</h3>
                  <p className="text-[12px] text-[#8E8E93] mt-0.5 line-clamp-1">
                    4-bit quantized • Whisper v3 • 4.2 GB
                  </p>
                </div>
              </div>

              {activeModel === 'Llama-3-8B-Instruct' ? (
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f4f3f8] text-[#34C759] text-[13px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  Active
                </span>
              ) : (
                <button
                  onClick={() => {
                    setActiveModel('Llama-3-8B-Instruct');
                    updateSettings({ activeModel: 'Llama-3-8B-Instruct' });
                  }}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  Switch
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] text-[#414754] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#34C759]">verified_user</span>
                Zero network telemetry
              </span>
              <button
                onClick={() => alert('Model is integrated and locked as default runtime engine.')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-medium active:scale-95 transition-transform flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete (4.2 GB)</span>
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-16" />

          {/* Row 2: Available Alternative Model */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eeedf3] flex items-center justify-center shrink-0 text-[#414754]">
                <span className="material-symbols-outlined text-[22px]">psychology</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-[17px] font-semibold text-black truncate">Phi-3.5 Mini (3.8B)</h3>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">Ultra-fast latency • 2.1 GB</p>
              </div>
            </div>

            {activeModel === 'Phi-3.5 Mini (3.8B)' ? (
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f4f3f8] text-[#34C759] text-[13px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                Active
              </span>
            ) : (
              <button
                onClick={() => handleDownloadModel('Phi-3.5 Mini (3.8B)')}
                disabled={downloadingModel === 'Phi-3.5 Mini (3.8B)'}
                className="shrink-0 min-h-[38px] px-4 py-1.5 rounded-full bg-[#d6e3ff] text-[#001b3e] text-[13px] font-semibold active:scale-95 transition-transform flex items-center gap-1.5 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {downloadingModel === 'Phi-3.5 Mini (3.8B)' ? 'hourglass_top' : 'cloud_download'}
                </span>
                <span>{downloadingModel === 'Phi-3.5 Mini (3.8B)' ? 'Downloading...' : 'Get 2.1 GB'}</span>
              </button>
            )}
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-16" />

          {/* Row 3: Inference Hardware Detail Row */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f4f3f8] flex items-center justify-center text-[#005ab3]">
                <span className="material-symbols-outlined text-[20px]">speed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-black">Compute Accelerator</span>
                <span className="text-[12px] text-[#8E8E93]">Apple Neural Engine (ANE) Core</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#005ab3]">
              <span className="text-[13px] font-semibold">Native</span>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </div>
          </div>
        </div>

        <p className="px-3 pt-2 text-[12px] text-[#8E8E93]">
          Models run completely locally via Core ML. No voice audio, transcripts, or prompts ever leave this device.
        </p>
      </section>

      {/* SECTION 2: TEXT-TO-SPEECH VOICES */}
      <section className="flex flex-col mb-6">
        <div className="px-2 pb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-semibold tracking-wider text-[#717786] uppercase">
            Text-To-Speech Voices
          </span>
          <span className="text-[12px] text-[#8E8E93]">{downloadedVoices.size} Downloaded</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-black/5">
          {/* Voice Row 1: Installed Default */}
          <div className="p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#d6e3ff] text-[#001b3e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">graphic_eq</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-medium text-black truncate">Kenji</span>
                  <span className="text-[12px] text-[#8E8E93]">(JP, Natural Female)</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eeedf3] text-[#414754] text-[11px]">Neural HQ</span>
                  <span className="text-[12px] text-[#8E8E93]">380 MB</span>
                  <span className="w-1 h-1 rounded-full bg-[#8E8E93]" />
                  <span className="text-[12px] text-[#005ab3] font-medium">Default</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleTestVoice('Kenji', 'こんにちは、日本語の勉強を始めましょう。')}
              aria-label="Preview Voice Kenji"
              type="button"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                testingVoice === 'Kenji' ? 'bg-[#005ab3] text-white' : 'bg-[#f4f3f8] text-[#005ab3] hover:bg-[#d6e3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">volume_up</span>
            </button>
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-14" />

          {/* Voice Row 2: Installed */}
          <div className="p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#d6e3ff] text-[#001b3e] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">graphic_eq</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-medium text-black truncate">Daiki</span>
                  <span className="text-[12px] text-[#8E8E93]">(JP, Deep Male)</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eeedf3] text-[#414754] text-[11px]">Neural HQ</span>
                  <span className="text-[12px] text-[#8E8E93]">410 MB</span>
                  <span className="w-1 h-1 rounded-full bg-[#8E8E93]" />
                  <span className="text-[12px] text-[#8E8E93] font-medium">Installed</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleTestVoice('Daiki', '本日のフラッシュカード復習を開始します。')}
              aria-label="Preview Voice Daiki"
              type="button"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                testingVoice === 'Daiki' ? 'bg-[#005ab3] text-white' : 'bg-[#f4f3f8] text-[#005ab3] hover:bg-[#d6e3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">volume_up</span>
            </button>
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-14" />

          {/* Voice Row 3: Sakura */}
          <div className="p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#eeedf3] text-[#717786] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">spatial_audio_off</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-medium text-black truncate">Sakura</span>
                  <span className="text-[12px] text-[#8E8E93]">(JP, Casual Studio)</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eeedf3] text-[#414754] text-[11px]">Ultra HD</span>
                  <span className="text-[12px] text-[#8E8E93]">620 MB</span>
                </div>
              </div>
            </div>

            {downloadedVoices.has('Sakura') ? (
              <button
                onClick={() => handleTestVoice('Sakura', '今日も一緒に頑張りましょう！')}
                type="button"
                className="w-11 h-11 rounded-full flex items-center justify-center bg-[#f4f3f8] text-[#005ab3]"
              >
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
              </button>
            ) : (
              <button
                onClick={() => handleDownloadVoice('Sakura')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-[#f4f3f8] text-[#005ab3] text-[13px] font-semibold flex items-center gap-1 active:bg-[#eeedf3]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>620 MB</span>
              </button>
            )}
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-14" />

          {/* Voice Row 4: Elena */}
          <div className="p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#eeedf3] text-[#717786] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">spatial_audio_off</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-medium text-black truncate">Elena</span>
                  <span className="text-[12px] text-[#8E8E93]">(EN, UK Coach)</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#eeedf3] text-[#414754] text-[11px]">Studio Neural</span>
                  <span className="text-[12px] text-[#8E8E93]">450 MB</span>
                </div>
              </div>
            </div>

            {downloadedVoices.has('Elena') ? (
              <button
                onClick={() => handleTestVoice('Elena', 'Ready for your English pronunciation recall session.')}
                type="button"
                className="w-11 h-11 rounded-full flex items-center justify-center bg-[#f4f3f8] text-[#005ab3]"
              >
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
              </button>
            ) : (
              <button
                onClick={() => handleDownloadVoice('Elena')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-[#f4f3f8] text-[#005ab3] text-[13px] font-semibold flex items-center gap-1 active:bg-[#eeedf3]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>450 MB</span>
              </button>
            )}
          </div>
        </div>

        <p className="px-3 pt-2 text-[12px] text-[#8E8E93]">
          High-fidelity local voices provide natural conversational audio feedback without buffering or internet access.
        </p>
      </section>

      {/* SECTION 3: AUDIO & RECOGNITION PREFERENCES */}
      <section className="flex flex-col mb-4">
        <div className="px-2 pb-1.5">
          <span className="text-[12px] font-semibold tracking-wider text-[#717786] uppercase">
            Audio & Recognition Preferences
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-black/5">
          {/* Toggle Row 1: Offline Whisper */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-black">Offline Whisper Transcription</span>
              <span className="text-[12px] text-[#8E8E93]">Transcribe pronunciation purely on-device</span>
            </div>
            <button
              onClick={handleToggleWhisper}
              aria-checked={settings.offlineWhisper}
              role="switch"
              type="button"
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.offlineWhisper ? 'bg-[#34C759]' : 'bg-[#eeedf3]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  settings.offlineWhisper ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-4" />

          {/* Toggle Row 2: Haptic Audio Feedback */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-black">Haptic Audio Feedback</span>
              <span className="text-[12px] text-[#8E8E93]">Taptic engine pulses during spoken rhythm</span>
            </div>
            <button
              onClick={handleToggleHaptic}
              aria-checked={settings.hapticAudio}
              role="switch"
              type="button"
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.hapticAudio ? 'bg-[#34C759]' : 'bg-[#eeedf3]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  settings.hapticAudio ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-[1px] bg-[#eeedf3] ml-4" />

          {/* Speech Rate Slider Row */}
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-black">Speech Feedback Rate</span>
              <span className="text-[13px] font-semibold text-[#005ab3]">
                {getRateLabel(settings.speechRate)}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="material-symbols-outlined text-[20px] text-[#8E8E93]">cruelty_free</span>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={settings.speechRate}
                onChange={handleRateChange}
                className="w-full h-1.5 bg-[#eeedf3] rounded-lg appearance-none cursor-pointer accent-[#005ab3]"
              />
              <span className="material-symbols-outlined text-[20px] text-[#8E8E93]">bolt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone / Factory Reset */}
      <div className="px-2 pt-2">
        <button
          onClick={handleResetData}
          type="button"
          className="w-full py-3 rounded-2xl bg-white border border-red-200 text-[#ba1a1a] text-[13px] font-semibold hover:bg-red-50 active:scale-95 transition-all"
        >
          Reset All Decks & Settings to Factory Defaults
        </button>
      </div>
    </div>
  );
};
