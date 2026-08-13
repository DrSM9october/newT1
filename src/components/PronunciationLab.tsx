import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types/dialect';
import { DIALECTS } from '../lib/dialectsData';
import { evaluatePronunciation, speakText, SpeechRecognitionService, PronunciationResult } from '../lib/speechEngine';
import { appDB } from '../lib/db';
import { Mic, MicOff, Volume2, Award, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

interface PronunciationLabProps {
  profile: UserProfile;
  onAddXp: (amount: number) => void;
}

export const PronunciationLab: React.FC<PronunciationLabProps> = ({ profile, onAddXp }) => {
  const currentDialect = DIALECTS[profile.activeDialect];
  const isFa = profile.uiLanguage === 'fa';

  const defaultPhrases = currentDialect?.commonVocabulary.map(v => v.term) || ['How is it going?'];

  const [targetPhrase, setTargetPhrase] = useState(defaultPhrases[0] || 'How is it going?');
  const [userTranscript, setUserTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);

  const speechService = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    speechService.current = new SpeechRecognitionService();
    if (defaultPhrases.length > 0) {
      setTargetPhrase(defaultPhrases[0]);
    }
  }, [profile.activeDialect]);

  const toggleRecording = () => {
    if (isRecording) {
      speechService.current?.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setUserTranscript('');
      setResult(null);

      speechService.current?.startListening(
        profile.activeDialect,
        (text, isFinal) => {
          setUserTranscript(text);
          if (isFinal) {
            setIsRecording(false);
            runEvaluation(text);
          }
        },
        (err) => {
          console.warn('Pronunciation lab mic error:', err);
          setIsRecording(false);
        }
      );
    }
  };

  const runEvaluation = async (transcript: string) => {
    const evalResult = evaluatePronunciation(targetPhrase, transcript, profile.activeDialect);
    setResult(evalResult);

    await appDB.addPronunciationAttempt({
      id: 'attempt-' + Date.now(),
      userId: profile.id,
      dialect: profile.activeDialect,
      targetPhrase,
      userAudioTranscript: transcript,
      score: evalResult.score,
      phonemeAnalysis: evalResult.phonemeAnalysis,
      problemWords: evalResult.problemWords,
      timestamp: new Date().toISOString()
    });

    if (evalResult.score >= 80) {
      onAddXp(25);
    } else {
      onAddXp(10);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
            <Mic className="w-3.5 h-3.5" />
            <span>آزمایشگاه سنجش هوشمند تلفظ</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isFa ? `تمرین و نمره‌دهی تلفظ ${currentDialect?.nameFa}` : `Pronunciation Lab in ${currentDialect?.nameEn}`}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            {isFa ? 'صدا ضبط کنید و نمره ۰ تا ۱۰۰ دقیق فونم‌ها را دریافت کنید.' : 'Record your voice and get instant 0-100 phoneme alignment scores.'}
          </p>
        </div>

        <button
          onClick={() => speakText(targetPhrase, profile.activeDialect, profile.voiceSpeed, profile.voicePitch)}
          className="px-3.5 py-2 rounded bg-[#0b0e14] hover:bg-gray-800 text-blue-400 border border-gray-800 font-mono font-bold text-xs flex items-center gap-2 shrink-0"
        >
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span>{isFa ? 'شنیدن صدای نمونه' : 'Listen Native Speaker'}</span>
        </button>
      </div>

      {/* Target Phrase Selection & Input */}
      <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 space-y-3">
        <label className="block text-xs font-mono font-bold text-gray-400 uppercase">
          {isFa ? 'عبارت مورد نظر برای تمرین تلفظ:' : 'Target Phrase for Practice:'}
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={targetPhrase}
            onChange={(e) => setTargetPhrase(e.target.value)}
            className="flex-1 bg-[#0b0e14] border border-gray-800 text-white font-bold text-lg p-3 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Preset Phrase Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-gray-500 shrink-0 text-[11px]">{isFa ? 'عبارات پیشنهادی:' : 'Presets:'}</span>
          {defaultPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTargetPhrase(phrase);
                setResult(null);
                setUserTranscript('');
              }}
              className={`shrink-0 px-2.5 py-1 rounded border transition-all text-xs ${
                targetPhrase === phrase
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-[#0b0e14] border-gray-800 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Recorder Stage */}
      <div className="p-6 rounded-lg bg-[#151921] border border-gray-800 text-center space-y-4 relative overflow-hidden">
        <button
          onClick={toggleRecording}
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-rose-600 animate-pulse ring-4 ring-rose-500/30 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <p className="text-xs font-mono font-bold text-gray-300">
          {isRecording
            ? (isFa ? 'در حال ضبط صدای شما... (صحبت کنید)' : 'Recording voice... Speak clearly')
            : (isFa ? 'روی دکمه بالا کلیک کنید و جمله را ادا کنید' : 'Click microphone above and pronounce the target phrase')}
        </p>

        {userTranscript && (
          <div className="p-3 rounded bg-[#0b0e14] border border-gray-800 text-gray-200 text-xs max-w-xl mx-auto font-mono">
            <span className="text-gray-500 text-[10px] block mb-0.5">{isFa ? 'صدا به متن تبدیل‌شده شما:' : 'Captured Transcript:'}</span>
            <span className="font-bold text-blue-400">"{userTranscript}"</span>
          </div>
        )}
      </div>

      {/* Score & Evaluation Results */}
      {result && (
        <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-md flex items-center justify-center text-2xl font-mono font-black text-white ${
                  result.score >= 85
                    ? 'bg-emerald-600'
                    : result.score >= 65
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                }`}
              >
                {result.score}%
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {result.score >= 85 ? 'تلفظ عالی و بومی!' : result.score >= 65 ? 'تلفظ خوب' : 'نیازمند تمرین بیشتر'}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 dir-rtl">{result.recommendationFa}</p>
              </div>
            </div>
          </div>

          {/* Phoneme Analysis Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">{isFa ? 'تحلیل فونم‌ها و آواها:' : 'Phoneme Breakdown:'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.phonemeAnalysis.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-[#0b0e14] border border-gray-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-400">{p.phoneme}</span>
                    <span className="text-gray-300">{p.feedbackFa}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
