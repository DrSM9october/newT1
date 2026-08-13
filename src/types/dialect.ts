export type DialectCode = 'en-US' | 'ar-IQ' | 'ar-LB';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface DialectInfo {
  code: DialectCode;
  nameEn: string;
  nameFa: string;
  nameNative: string;
  flag: string;
  descriptionFa: string;
  descriptionEn: string;
  phonemeMap: Record<string, string>;
  commonVocabulary: Array<{
    term: string;
    transliteration?: string;
    meaningFa: string;
    meaningEn: string;
    example: string;
    audioHint?: string;
  }>;
  systemPromptTemplate: string;
  ttsVoiceLang: string;
}

export interface UserProfile {
  id: string;
  name: string;
  activeDialect: DialectCode;
  level: CEFRLevel;
  xp: number;
  userLevel: number;
  streakDays: number;
  lastActiveDate: string;
  dailyXpGoal: number;
  todayXp: number;
  weeklyXpGoal: number;
  completedScenarios: string[];
  unlockedAchievements: string[];
  theme: 'dark' | 'light';
  uiLanguage: 'fa' | 'en';
  aiModelPreference: 'hybrid-gemini' | 'ollama-local-qwen';
  voiceSpeed: number; // 0.5 - 1.5
  voicePitch: number; // 0.5 - 1.5
  autoPlayAudio: boolean;
  offlineMode: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  transliteration?: string;
  translationFa?: string;
  translationEn?: string;
  audioUrl?: string;
  phonemeBreakdown?: string;
  grammarCorrections?: Array<{
    original: string;
    corrected: string;
    explanationFa: string;
    explanationEn: string;
  }>;
  pronunciationScore?: number;
  timestamp: string;
  dialect: DialectCode;
}

export interface SRSCard {
  id: string;
  userId: string;
  dialect: DialectCode;
  frontText: string;
  backTextFa: string;
  backTextEn: string;
  transliteration?: string;
  phoneticSpelling?: string;
  category: 'vocabulary' | 'grammar' | 'phrase' | 'pronunciation';
  repetition: number; // SM-2
  interval: number; // days
  easeFactor: number; // 1.3 - 2.5
  dueDate: string; // ISO date
  lastReviewedDate?: string;
  history: Array<{ date: string; grade: number }>;
}

export interface MistakeItem {
  id: string;
  userId: string;
  dialect: DialectCode;
  type: 'grammar' | 'vocabulary' | 'pronunciation';
  context: string;
  userAttempt: string;
  correctForm: string;
  explanationFa: string;
  explanationEn: string;
  occurrences: number;
  lastOccurredAt: string;
  resolved: boolean;
}

export interface PronunciationAttempt {
  id: string;
  userId: string;
  dialect: DialectCode;
  targetPhrase: string;
  userAudioTranscript: string;
  score: number; // 0 - 100
  phonemeAnalysis: Array<{
    phoneme: string;
    status: 'correct' | 'warning' | 'incorrect';
    feedbackFa: string;
    feedbackEn: string;
  }>;
  problemWords: string[];
  timestamp: string;
}

export interface RoleplayScenario {
  id: string;
  dialect: DialectCode;
  titleFa: string;
  titleEn: string;
  categoryFa: string;
  categoryEn: string;
  difficulty: CEFRLevel;
  characterName: string;
  characterRoleFa: string;
  characterRoleEn: string;
  characterAvatar: string;
  contextDescriptionFa: string;
  contextDescriptionEn: string;
  initialPrompt: string;
  suggestedOpening: string;
  keyPhrasesToUse: string[];
}

export interface LearningPath {
  id: string;
  dialect: DialectCode;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  level: CEFRLevel;
  icon: string;
  stepsCount: number;
  scenarios: string[];
  recommendedVocabulary: string[];
}

export interface Achievement {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  icon: string;
  requiredXp?: number;
  requiredStreak?: number;
  requiredCards?: number;
  requiredScenarios?: number;
  badgeColor: string;
}

export interface UserMemory {
  id: string;
  userId: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}
