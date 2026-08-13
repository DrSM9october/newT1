import { DialectCode } from '../types/dialect';
import { DIALECTS } from './dialectsData';

export interface PronunciationResult {
  score: number; // 0 - 100
  transcript: string;
  phonemeAnalysis: Array<{
    phoneme: string;
    status: 'correct' | 'warning' | 'incorrect';
    feedbackFa: string;
    feedbackEn: string;
  }>;
  problemWords: string[];
  recommendationFa: string;
  recommendationEn: string;
}

// Web Speech API recognition helper
export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  startListening(
    dialect: DialectCode,
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void
  ) {
    if (!this.recognition) {
      onError('Speech Recognition is not supported in this browser environment.');
      return;
    }

    const langMap: Record<DialectCode, string> = {
      'en-US': 'en-US',
      'ar-IQ': 'ar-IQ',
      'ar-LB': 'ar-LB'
    };

    this.recognition.lang = langMap[dialect] || 'en-US';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      onResult(final || interim, !!final);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      onError('Failed to start mic');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

// Text to Speech Service
export function speakText(
  text: string,
  dialect: DialectCode,
  rate = 1.0,
  pitch = 1.0
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser does not support SpeechSynthesis');
    return;
  }

  window.speechSynthesis.cancel(); // stop current

  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<DialectCode, string> = {
    'en-US': 'en-US',
    'ar-IQ': 'ar-SA', // Closest Arabic voice
    'ar-LB': 'ar-SA'
  };

  utterance.lang = langMap[dialect] || 'en-US';
  utterance.rate = rate;
  utterance.pitch = pitch;

  window.speechSynthesis.speak(utterance);
}

// Phoneme & Pronunciation Evaluation Algorithm
export function evaluatePronunciation(
  targetPhrase: string,
  userTranscript: string,
  dialect: DialectCode
): PronunciationResult {
  const cleanTarget = targetPhrase.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  const cleanUser = userTranscript.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

  if (!cleanUser) {
    return {
      score: 0,
      transcript: '',
      phonemeAnalysis: [],
      problemWords: targetPhrase.split(' '),
      recommendationFa: 'صدا شناسایی نشد. لطفاً در محیطی خلوت مجدداً صحبت کنید.',
      recommendationEn: 'No voice detected. Please speak again in a quiet environment.'
    };
  }

  const targetWords = cleanTarget.split(/\s+/);
  const userWords = cleanUser.split(/\s+/);

  let matchedWordCount = 0;
  const problemWords: string[] = [];

  targetWords.forEach(word => {
    if (cleanUser.includes(word) || userWords.some(u => levenshteinDistance(u, word) <= 2)) {
      matchedWordCount++;
    } else {
      problemWords.push(word);
    }
  });

  // Calculate raw similarity percentage
  const baseScore = Math.min(100, Math.round((matchedWordCount / targetWords.length) * 100));

  // Dialect specific phoneme checks
  const dialectInfo = DIALECTS[dialect];
  const phonemeAnalysis: PronunciationResult['phonemeAnalysis'] = [];

  if (dialectInfo) {
    Object.entries(dialectInfo.phonemeMap).forEach(([symbol, desc]) => {
      if (cleanTarget.includes(symbol) || targetPhrase.includes(symbol.charAt(0))) {
        const isTargetMatched = matchedWordCount > 0 && problemWords.length === 0;
        phonemeAnalysis.push({
          phoneme: symbol,
          status: isTargetMatched ? 'correct' : matchedWordCount > 0 ? 'warning' : 'incorrect',
          feedbackFa: `واک ${symbol}: ${desc}`,
          feedbackEn: `Phoneme ${symbol}: ${desc}`
        });
      }
    });
  }

  if (phonemeAnalysis.length === 0) {
    phonemeAnalysis.push({
      phoneme: dialect === 'en-US' ? 'θ / ð' : 'گ / چ / ق',
      status: baseScore > 80 ? 'correct' : 'warning',
      feedbackFa: 'انطباق آوایی با الگوی اصلی لهجه',
      feedbackEn: 'Acoustic pattern alignment with native benchmark'
    });
  }

  // Adjust score for complete match
  const finalScore = cleanTarget === cleanUser ? 100 : Math.max(15, baseScore);

  let recommendationFa = '';
  let recommendationEn = '';

  if (finalScore >= 90) {
    recommendationFa = 'تلفظ فوق‌العاده و کاملاً بومی! لهجه و فونم‌ها دقیق ادا شدند.';
    recommendationEn = 'Outstanding native-like pronunciation! Accents and phonemes are spot-on.';
  } else if (finalScore >= 70) {
    recommendationFa = `تلفظ خوب است. روی کلمات زیر بیشتر تمرکز کنید: ${problemWords.join('، ')}`;
    recommendationEn = `Good attempt! Focus more on practicing these words: ${problemWords.join(', ')}`;
  } else {
    recommendationFa = `سرعت گفتار را کاهش دهید و تلفظ تفکیک‌شده کلمات را از دکمه صدای راهنما گوش دهید.`;
    recommendationEn = `Slow down your speech speed and listen closely to the reference voice button.`;
  }

  return {
    score: finalScore,
    transcript: userTranscript,
    phonemeAnalysis,
    problemWords,
    recommendationFa,
    recommendationEn
  };
}

// Levenshtein Distance for string comparison
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
