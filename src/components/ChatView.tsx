import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, RoleplayScenario } from '../types/dialect';
import { DIALECTS } from '../lib/dialectsData';
import { SpeechRecognitionService, speakText } from '../lib/speechEngine';
import { appDB } from '../lib/db';
import { createCardFromMistake } from '../lib/srsEngine';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  BookmarkPlus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Languages,
  XCircle
} from 'lucide-react';

interface ChatViewProps {
  profile: UserProfile;
  activeScenario: RoleplayScenario | null;
  onClearScenario: () => void;
  onAddXp: (amount: number) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  profile,
  activeScenario,
  onClearScenario,
  onAddXp,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [savedCardIds, setSavedCardIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechService = useRef<SpeechRecognitionService | null>(null);

  const currentDialect = DIALECTS[profile.activeDialect];
  const isFa = profile.uiLanguage === 'fa';

  useEffect(() => {
    speechService.current = new SpeechRecognitionService();
    loadMessages();
  }, [profile.activeDialect]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadMessages = async () => {
    const list = await appDB.getMessages(profile.activeDialect);
    if (list.length === 0) {
      // Add initial greeting message
      const initialGreeting: ChatMessage = {
        id: 'msg-init-' + Date.now(),
        conversationId: 'conv-1',
        sender: 'assistant',
        text: activeScenario
          ? activeScenario.initialPrompt
          : currentDialect?.code === 'ar-IQ'
          ? 'هلا بيك عيني! شلونك اليوم؟ شنو تحب نسولف هسّه؟'
          : currentDialect?.code === 'ar-LB'
          ? 'هاي! كيفك اليوم؟ شو بتحب نحكي هلق؟'
          : 'Hey there! Welcome to American English conversation class. What would you like to talk about today?',
        transliteration: currentDialect?.code === 'ar-IQ'
          ? 'Hala beek einy! Shlonak el-yom? Shoo t\'hib nsolif hassa?'
          : currentDialect?.code === 'ar-LB'
          ? 'Hi! Kifak el-yom? Shoo b\'theb nhki halaq?'
          : undefined,
        translationFa: currentDialect?.code === 'ar-IQ'
          ? 'خوش آمدی عزیزم! امروزی چطوری؟ دوست داری الان درباره چی صحبت کنیم؟'
          : currentDialect?.code === 'ar-LB'
          ? 'سلام! امروزی چطوری؟ دوست داری الان درباره چی حرف بزنیم؟'
          : 'سلام! به کلاس مکالمه انگلیسی آمریکایی خوش آمدید. دوست دارید امروز درباره چه چیزی صحبت کنیم؟',
        translationEn: 'Welcome dear! How are you doing today? What would you like to talk about right now?',
        timestamp: new Date().toISOString(),
        dialect: profile.activeDialect
      };
      await appDB.addMessage(initialGreeting);
      setMessages([initialGreeting]);
    } else {
      setMessages(list);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      conversationId: 'conv-1',
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
      dialect: profile.activeDialect
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);
    await appDB.addMessage(userMsg);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          dialect: profile.activeDialect,
          history: newHistory,
          scenarioPrompt: activeScenario ? activeScenario.contextDescriptionEn : undefined
        })
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: 'msg-bot-' + Date.now(),
        conversationId: 'conv-1',
        sender: 'assistant',
        text: data.text,
        transliteration: data.transliteration,
        translationFa: data.translationFa,
        translationEn: data.translationEn,
        grammarCorrections: data.grammarCorrections,
        timestamp: new Date().toISOString(),
        dialect: profile.activeDialect
      };

      setMessages((prev) => [...prev, botMsg]);
      await appDB.addMessage(botMsg);
      onAddXp(15); // Add XP for messaging

      if (profile.autoPlayAudio) {
        speakText(data.text, profile.activeDialect, profile.voiceSpeed, profile.voicePitch);
      }
    } catch (e) {
      console.error('Chat request error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      speechService.current?.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.current?.startListening(
        profile.activeDialect,
        (text, isFinal) => {
          setInputText(text);
          if (isFinal) {
            setIsRecording(false);
            handleSendMessage(text);
          }
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsRecording(false);
        }
      );
    }
  };

  const handleSaveToSRS = async (msg: ChatMessage) => {
    await createCardFromMistake({
      id: 'mistake-' + Date.now(),
      userId: profile.id,
      dialect: profile.activeDialect,
      type: 'vocabulary',
      context: 'افزوده شده از مکالمه چت',
      userAttempt: msg.text,
      correctForm: msg.text,
      explanationFa: msg.translationFa || 'واژه/جمله ذخیره‌شده از چت',
      explanationEn: msg.translationEn || 'Saved phrase from chat',
      occurrences: 1,
      lastOccurredAt: new Date().toISOString(),
      resolved: false
    });

    setSavedCardIds((prev) => new Set(prev).add(msg.id));
    onAddXp(10);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-1 sm:px-3 py-1 overflow-hidden">
      {/* Active Scenario Context Banner with Mobile Back Button */}
      {activeScenario && (
        <div className="mb-2 p-2.5 rounded-lg bg-[#151921] border border-blue-500/40 text-gray-100 flex items-center justify-between gap-2 shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClearScenario}
              className="p-1 rounded bg-[#0b0e14] border border-gray-800 text-blue-400 hover:text-white transition-colors text-xs font-mono font-bold flex items-center gap-1"
              title="بازگشت به چت عادی"
            >
              <span>{isFa ? '◀ بازگشت' : '◀ Back'}</span>
            </button>
            <span className="text-xl">{activeScenario.characterAvatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-blue-300">
                  {isFa ? activeScenario.titleFa : activeScenario.titleEn}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono font-bold border border-blue-500/30">
                  {activeScenario.difficulty}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 font-mono">
                {isFa ? activeScenario.characterRoleFa : activeScenario.characterRoleEn} ({activeScenario.characterName})
              </p>
            </div>
          </div>
          <button
            onClick={onClearScenario}
            className="p-1 rounded bg-[#0b0e14] hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-gray-800 transition-colors"
            title="خروج از سناریو"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto mobile-scroll-container space-y-3 p-3 sm:p-4 rounded-lg bg-[#151921] border border-gray-800 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isCardSaved = savedCardIds.has(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
            >
              <div
                className={`p-3.5 sm:p-4 rounded-lg border text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#0b0e14] border-gray-800 text-gray-100'
                }`}
              >
                {/* Main Dialect Text */}
                <div className="font-medium text-base text-gray-100 dir-auto">
                  {msg.text}
                </div>

                {/* Transliteration for Arabic Dialects */}
                {msg.transliteration && (
                  <div className="text-xs text-blue-400 font-mono italic mt-1">
                    {msg.transliteration}
                  </div>
                )}

                {/* Translations */}
                {showTranslations && (msg.translationFa || msg.translationEn) && (
                  <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-gray-300 space-y-0.5">
                    {msg.translationFa && <div className="text-gray-300 dir-rtl">‌{msg.translationFa}</div>}
                  </div>
                )}

                {/* Grammar Corrections */}
                {msg.grammarCorrections && msg.grammarCorrections.length > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                    <div className="flex items-center gap-1.5 font-bold mb-1 font-mono text-[11px] uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isFa ? 'نکته گرامری و تصحیح:' : 'Grammar Tip:'}</span>
                    </div>
                    {msg.grammarCorrections.map((c, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="line-through text-gray-500 mr-2">{c.original}</span>
                        <span className="font-bold text-green-400 font-mono">➔ {c.corrected}</span>
                        <p className="text-[11px] text-amber-300/90 mt-0.5">{isFa ? c.explanationFa : c.explanationEn}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Controls for Assistant Messages */}
                {!isUser && (
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-gray-400 pt-1.5 border-t border-gray-800">
                    <button
                      onClick={() => speakText(msg.text, profile.activeDialect, profile.voiceSpeed, profile.voicePitch)}
                      className="flex items-center gap-1.5 hover:text-blue-400 font-mono font-medium transition-colors"
                      title="پخش صوت با لهجه بومی"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isFa ? 'تلفظ' : 'Listen'}</span>
                    </button>

                    <button
                      onClick={() => handleSaveToSRS(msg)}
                      disabled={isCardSaved}
                      className={`flex items-center gap-1.5 font-mono font-medium transition-colors ${
                        isCardSaved ? 'text-green-400' : 'hover:text-purple-400'
                      }`}
                      title="ذخیره در فلش کارت های مرور"
                    >
                      {isCardSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                      <span>{isCardSaved ? (isFa ? 'ذخیره شد' : 'Saved') : (isFa ? 'افزودن به SRS' : 'Add Card')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-xs p-3 bg-[#0b0e14] rounded-md border border-gray-800 w-36 font-mono animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span>{isFa ? 'در حال پاسخ...' : 'Typing...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Openings */}
      {activeScenario && activeScenario.suggestedOpening && (
        <div className="my-1.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-500 text-[10px] uppercase font-mono font-bold shrink-0">
            {isFa ? 'پیشنهاد شروع:' : 'Suggested:'}
          </span>
          <button
            onClick={() => setInputText(activeScenario.suggestedOpening)}
            className="shrink-0 px-2.5 py-1 rounded bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 font-mono text-xs transition-colors"
          >
            {activeScenario.suggestedOpening}
          </button>
        </div>
      )}

      {/* Input Form & Speech Microphone */}
      <div className="mt-2 bg-[#151921] border border-gray-800 p-2 sm:p-2.5 rounded-lg shadow-sm flex items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-md flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-rose-600 text-white animate-bounce'
              : 'bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-700'
          }`}
          title={isRecording ? 'توقف ضبط صدا' : 'ضبط و ارسال صوتی (Push-To-Talk)'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            isRecording
              ? (isFa ? 'در حال شنیدن صدای شما...' : 'Listening to your voice...')
              : (isFa ? `به لهجه ${currentDialect?.nameFa} بنویسید یا صحبت کنید...` : `Type or speak in ${currentDialect?.nameEn}...`)
          }
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm focus:outline-none px-2 font-sans"
        />

        <button
          type="button"
          onClick={() => setShowTranslations(!showTranslations)}
          className={`p-2 rounded-md border text-xs font-mono font-semibold ${
            showTranslations ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400'
          }`}
          title="نمایش / پنهان‌سازی ترجمه"
        >
          <Languages className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="p-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
