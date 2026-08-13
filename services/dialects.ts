// Central registry for every supported dialect/language variant.
// Adding a new dialect only requires one entry here.

export type DialectCode =
  | "american"
  | "shami"
  | "egyptian"
  | "gulf"
  | "maghrebi"
  | "darija"
  | "iraqi"
  | "lebanese";

export interface DialectInfo {
  code: DialectCode;
  labelEn: string;
  labelNative: string;
  flag: string;
  language: "en" | "ar";
  region: string;
  ttsLanguageCode: string;
  ttsVoiceName: string;
  sttLang: string;
  systemNote: string; // dialect-flavor instructions for the AI
  phonemeFocus: string[]; // sounds learners of this dialect commonly struggle with
  msaComparisonNote: string; // how this colloquial variant differs from Modern Standard Arabic
}

export const DIALECTS: Record<DialectCode, DialectInfo> = {
  american: {
    code: "american",
    labelEn: "American English",
    labelNative: "American English",
    flag: "🇺🇸",
    language: "en",
    region: "United States",
    ttsLanguageCode: "en-US",
    ttsVoiceName: "en-US-Neural2-J",
    sttLang: "en-US",
    systemNote:
      "Natural contemporary American English. Use everyday contractions and idioms; avoid overly formal textbook phrasing.",
    phonemeFocus: ["r", "th", "t-flap", "v", "w"],
    msaComparisonNote: "Not applicable (English).",
  },
  shami: {
    code: "shami",
    labelEn: "Levantine Arabic (Shami)",
    labelNative: "الشامي",
    flag: "🇸🇾",
    language: "ar",
    region: "Syria / Jordan / Palestine",
    ttsLanguageCode: "ar-XA",
    ttsVoiceName: "ar-XA-Wavenet-B",
    sttLang: "ar-JO",
    systemNote:
      "Natural everyday Levantine (Shami) Arabic as spoken in Damascus/Amman/Jerusalem streets. Avoid stiff Modern Standard Arabic (فصحى) unless explicitly asked for the formal equivalent.",
    phonemeFocus: ["ق→ء", "ث→ت/س", "ذ→د/ز", "ج"],
    msaComparisonNote:
      "قاف often glottalized (قال → 'aal), ث/ذ frequently shift to ت/د or س/ز, distinct intonation from MSA.",
  },
  egyptian: {
    code: "egyptian",
    labelEn: "Egyptian Arabic",
    labelNative: "المصري",
    flag: "🇪🇬",
    language: "ar",
    region: "Egypt",
    ttsLanguageCode: "ar-XA",
    ttsVoiceName: "ar-XA-Wavenet-A",
    sttLang: "ar-EG",
    systemNote:
      "Natural everyday Cairene Egyptian Arabic (masri). Use common Egyptian vocabulary and the distinctive ج pronounced as a hard 'g'.",
    phonemeFocus: ["ج→g", "ق→ء", "ث→ت/س"],
    msaComparisonNote:
      "ج is pronounced as a hard 'g' (unlike MSA's 'j'), قاف is often dropped to a glottal stop, many unique vocabulary items differ from MSA.",
  },
  gulf: {
    code: "gulf",
    labelEn: "Gulf Arabic (Khaleeji)",
    labelNative: "الخليجي",
    flag: "🇸🇦",
    language: "ar",
    region: "Saudi Arabia / UAE / Kuwait / Qatar / Bahrain",
    ttsLanguageCode: "ar-XA",
    ttsVoiceName: "ar-XA-Wavenet-C",
    sttLang: "ar-SA",
    systemNote:
      "Natural everyday Khaleeji (Gulf) Arabic. Reflect common Gulf vocabulary and the ك/ج variations heard across Saudi/Emirati/Kuwaiti speech.",
    phonemeFocus: ["ج→y (regional)", "ك→ch (regional)", "ق"],
    msaComparisonNote:
      "Retains قاف more often than Levantine/Egyptian; ك sometimes becomes 'ch' in certain positions; heavy use of Gulf-specific vocabulary absent from MSA.",
  },
  maghrebi: {
    code: "maghrebi",
    labelEn: "Maghrebi Arabic",
    labelNative: "المغاربي",
    flag: "🇹🇳",
    language: "ar",
    region: "Tunisia / Algeria / Libya",
    ttsLanguageCode: "ar-XA",
    ttsVoiceName: "ar-XA-Wavenet-D",
    sttLang: "ar-TN",
    systemNote:
      "Natural everyday Maghrebi Arabic (Tunisian/Algerian leaning). Expect heavy French loanwords and fast, consonant-cluster-dense speech; avoid MSA phrasing.",
    phonemeFocus: ["consonant clusters", "ق→g/q (regional)", "French loanwords"],
    msaComparisonNote:
      "Vowels frequently dropped creating consonant clusters unlike MSA; large amount of French (and some Berber) vocabulary mixed in.",
  },
  darija: {
    code: "darija",
    labelEn: "Moroccan Arabic (Darija)",
    labelNative: "الدارجة",
    flag: "🇲🇦",
    region: "Morocco",
    language: "ar",
    ttsLanguageCode: "ar-XA",
    ttsVoiceName: "ar-XA-Wavenet-B",
    sttLang: "ar-MA",
    systemNote:
      "Natural everyday Moroccan Darija. Expect French and Amazigh (Berber) loanwords, short vowels, and vocabulary quite distant from MSA.",
    phonemeFocus: ["consonant clusters", "French loanwords", "ق"],
    msaComparisonNote:
      "Furthest from MSA of the major dialects: distinct core vocabulary, French/Amazigh influence, and heavily reduced vowels.",
  },
  iraqi: {
    code: "iraqi",
    labelEn: "Iraqi Arabic",
    labelNative: "العراقي",
    flag: "🇮🇶",
    language: "ar",
    region: "Iraq",
    ttsLanguageCode: "ar-XA",
    ttsVoiceName: "ar-XA-Wavenet-A",
    sttLang: "ar-IQ",
    systemNote:
      "Natural everyday Iraqi Arabic; avoid artificial MSA. Use Iraqi-specific vocabulary (e.g. 'شلونك', 'اكو/ماكو').",
    phonemeFocus: ["ع", "ح", "ق", "خ", "غ"],
    msaComparisonNote:
      "قاف often becomes 'g'; distinctive vocabulary such as شلون (how), اكو/ماكو (there is/isn't) not found in MSA.",
  },
  lebanese: {
    code: "lebanese",
    labelEn: "Lebanese Arabic",
    labelNative: "اللبناني",
    flag: "🇱🇧",
    language: "ar",
    region: "Lebanon",
    ttsLanguageCode: "ar-LB",
    ttsVoiceName: "ar-LB-Wavenet-A",
    sttLang: "ar-LB",
    systemNote:
      "Natural everyday Lebanese Arabic; avoid artificial MSA. Frequent code-switching with French/English is natural and acceptable.",
    phonemeFocus: ["ع", "ح", "ق", "خ", "غ"],
    msaComparisonNote:
      "قاف frequently dropped to a glottal stop; frequent French/English code-switching not present in MSA.",
  },
};

export const DIALECT_LIST = Object.values(DIALECTS);

export function isDialect(x: string): x is DialectCode {
  return x in DIALECTS;
}
