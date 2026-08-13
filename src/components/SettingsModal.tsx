import React from 'react';
import { UserProfile } from '../types/dialect';
import { DIALECTS } from '../lib/dialectsData';
import { X, Cpu, Volume2, Globe, RefreshCw, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const isFa = profile.uiLanguage === 'fa';
  const currentDialect = DIALECTS[profile.activeDialect];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#151921] border border-gray-800 rounded-lg max-w-xl w-full overflow-hidden text-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold font-mono uppercase text-white">
              {isFa ? 'تنظیمات پیشرفته سیستم DialectAI' : 'Advanced System Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#0b0e14] text-gray-400 hover:text-white border border-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-mono">
          {/* AI Model Router Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-400" />
              <span>{isFa ? 'موتور هوش مصنوعی (AI Model Router):' : 'AI Engine Model Preference:'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateProfile({ aiModelPreference: 'hybrid-gemini' })}
                className={`p-3 rounded border text-xs font-bold flex flex-col gap-1 text-right ${
                  profile.aiModelPreference === 'hybrid-gemini'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span>Gemini 3.6 Flash (ابری)</span>
                <span className="text-[10px] font-normal text-gray-500">سرعت بالا + پاسخ‌های دقیق</span>
              </button>

              <button
                onClick={() => onUpdateProfile({ aiModelPreference: 'ollama-local-qwen' })}
                className={`p-3 rounded border text-xs font-bold flex flex-col gap-1 text-right ${
                  profile.aiModelPreference === 'ollama-local-qwen'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-[#0b0e14] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span>Qwen 2.5 (Ollama محلی)</span>
                <span className="text-[10px] font-normal text-gray-500">آفلاین + حفظ حریم خصوصی</span>
              </button>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <label className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>{isFa ? 'تنظیمات صدا و تلفظ (TTS/STT):' : 'Voice Synthesis Settings:'}</span>
            </label>

            {/* Voice Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{isFa ? 'سرعت خواندن گفتار:' : 'Speech Speed:'}</span>
                <span className="font-bold text-blue-400">{profile.voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={profile.voiceSpeed}
                onChange={(e) => onUpdateProfile({ voiceSpeed: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Auto Play Audio */}
            <div className="flex items-center justify-between p-3 rounded bg-[#0b0e14] border border-gray-800">
              <span className="text-xs font-medium text-gray-300">
                {isFa ? 'پخش خودکار صدای پاسخ‌های هوش مصنوعی' : 'Auto-play audio responses'}
              </span>
              <input
                type="checkbox"
                checked={profile.autoPlayAudio}
                onChange={(e) => onUpdateProfile({ autoPlayAudio: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Dialect System Prompt Preview */}
          <div className="space-y-2 pt-3 border-t border-gray-800">
            <label className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>پرامپت سیستمی لهجه {currentDialect?.nameFa}:</span>
            </label>
            <div className="p-3 rounded bg-[#0b0e14] border border-gray-800 text-[11px] text-gray-400 leading-relaxed overflow-x-auto">
              {currentDialect?.systemPromptTemplate}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#0b0e14] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs"
          >
            {isFa ? 'تایید و ذخیره' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
