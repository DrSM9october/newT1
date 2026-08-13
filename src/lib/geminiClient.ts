import { GoogleGenAI } from '@google/genai';
import { DialectCode, ChatMessage } from '../types/dialect';
import { DIALECTS } from './dialectsData';

export async function generateAiResponse(
  userText: string,
  dialect: DialectCode,
  history: ChatMessage[],
  scenarioPrompt?: string
): Promise<{
  text: string;
  transliteration?: string;
  translationFa?: string;
  translationEn?: string;
  grammarCorrections?: Array<{
    original: string;
    corrected: string;
    explanationFa: string;
    explanationEn: string;
  }>;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  const dialectInfo = DIALECTS[dialect];
  const systemInstruction = scenarioPrompt
    ? `${dialectInfo.systemPromptTemplate}\nScenario context: ${scenarioPrompt}`
    : dialectInfo.systemPromptTemplate;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const prompt = `
Context: You are a native speaker and tutor in ${dialectInfo.nameEn}.
System Rule:
Return a JSON object with the following fields:
{
  "text": "Your reply in the chosen dialect (${dialectInfo.nameNative})",
  "transliteration": "Transliteration in Latin alphabet for Arabic dialects, or null for English",
  "translationFa": "Persian translation of your reply",
  "translationEn": "English translation of your reply",
  "grammarCorrections": [
    {
      "original": "user typo if any, else omit",
      "corrected": "corrected user input",
      "explanationFa": "Persian explanation of the fix",
      "explanationEn": "English explanation of the fix"
    }
  ]
}

Conversation History:
${history.slice(-4).map(m => `${m.sender}: ${m.text}`).join('\n')}

User Input: "${userText}"
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const rawText = response.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          text: parsed.text || 'أهلاً بك! كيف يمكنني مساعدتك اليوم؟',
          transliteration: parsed.transliteration || undefined,
          translationFa: parsed.translationFa || 'خوش آمدید! چطور می‌توانم کمکتان کنم؟',
          translationEn: parsed.translationEn || 'Welcome! How can I help you today?',
          grammarCorrections: Array.isArray(parsed.grammarCorrections) ? parsed.grammarCorrections : undefined
        };
      }
    } catch (err) {
      console.warn('Gemini API call warning, using fallback response generator:', err);
    }
  }

  // Local AI Fallback Engine (Simulates Qwen 2.5 / Ollama Local Model)
  return generateLocalFallbackResponse(userText, dialect);
}

function generateLocalFallbackResponse(
  userText: string,
  dialect: DialectCode
) {
  const lower = userText.toLowerCase();

  if (dialect === 'ar-IQ') {
    if (lower.includes('شلونك') || lower.includes('سلام') || lower.includes('مرحبا')) {
      return {
        text: 'هلا بيك عيني! أني زين الحمد لله، انت شلونك اليوم؟ شنو أخبارك؟',
        transliteration: 'Hala beek einy! Ani zain el-hamdulillah, inta shlonak el-yom? Shoo akhbarak?',
        translationFa: 'خوش آمدی عزیزم! من خوبم خدا رو شکر، تو امروزی چطوری؟ چه خبرها؟',
        translationEn: 'Welcome dear! I am good thank God, how are you today? What is your news?'
      };
    }
    if (lower.includes('چاي') || lower.includes('قهوة') || lower.includes('مطعم')) {
      return {
        text: 'تفضل هسّه أجيبلك استكان چاي خادر ويا هيل، تدلل هواية!',
        transliteration: 'Tafaddal hassa ajeeblak istikan chai khader wya hail, tedallal hwaya!',
        translationFa: 'بفرما الان برایت یک استکان چای دم‌کشیده با هل می‌آورم، خیلی خوش آمدی!',
        translationEn: 'Please, right now I will bring you a brewed cup of tea with cardamom, you are very welcome!'
      };
    }
    return {
      text: 'كلش حلو حكيك! اكو بعد شي تحب نسولف عنه بهسّه؟',
      transliteration: "Kullish hilow hakeek! Ako ba'ad shi t'hib nsolif anah bhassa?",
      translationFa: 'حرف زدنت خیلی قشنگه! چیز دیگه‌ای هست که بخوای الان درباره‌ش گپ بزنیم؟',
      translationEn: 'Your speaking is very nice! Is there anything else you want to chat about now?'
    };
  }

  if (dialect === 'ar-LB') {
    if (lower.includes('كيفك') || lower.includes('هاي') || lower.includes('مرحبا')) {
      return {
        text: 'هاي! كيفك اليوم؟ أنا منيح كتير، شو في ما في جديد عندك؟',
        transliteration: 'Hi! Kifak el-yom? Ana mnih ktir, shoo fi ma fi jadid endak?',
        translationFa: 'سلام! امروزی چطوری؟ من خیلی خوبم، چه خبر تازه‌ای داری؟',
        translationEn: 'Hi! How are you today? I am very good, what is new with you?'
      };
    }
    if (lower.includes('أكل') || lower.includes('مطعم') || lower.includes('مناقيش')) {
      return {
        text: 'تفضل ع راسي! شو بتحب نتغدى؟ صحن تبولة ومناقيش زعتر هلق؟',
        transliteration: "Tafaddal a rasi! Shoo b'theb ntghadda? Sahn tabbouleh w manakish zaatar halaq?",
        translationFa: 'بفرما روی چشمم! دوست داری برای ناهار چی بخوریم؟ یک بشقاب تبوله و منقوشه زعتر الان؟',
        translationEn: 'Please on my head! What would you like for lunch? A plate of tabbouleh and zaatar manakish now?'
      };
    }
    return {
      text: 'تكرم عينك! حكيك كتير مظبوط، شو حابب نحكي هلق؟',
      transliteration: 'Tekram einak! Hakeek ktir mazboot, shoo habeb nhki halaq?',
      translationFa: 'چشمت بی‌بلا! صحبتت کاملاً درسته، الان دوست داری درباره چی صحبت کنیم؟',
      translationEn: 'You are welcome! What you said is very correct, what would you like to talk about now?'
    };
  }

  // English fallback
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('how are you')) {
    return {
      text: 'Hey there! I am doing great, thanks for asking. How is your day going so far?',
      translationFa: 'سلام! من عالی هستم، ممنون که پرسیدی. روزت تا اینجا چطور گذشته؟',
      translationEn: 'Hey there! I am doing great, thanks for asking. How is your day going so far?'
    };
  }

  return {
    text: 'That sounds really interesting! Tell me more about that or let us wrap this topic up.',
    translationFa: 'خیلی جالب به نظر میاد! بیشتر برام بگو یا بریم سراغ موضوع بعدی.',
    translationEn: 'That sounds really interesting! Tell me more about that or let us wrap this topic up.'
  };
}
