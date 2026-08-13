import { SRSCard, MistakeItem, DialectCode } from '../types/dialect';
import { appDB } from './db';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Rating mapping:
 * 1: Again (q=0) - Total lapse, reset interval
 * 2: Hard (q=3) - Correct with difficulty
 * 3: Good (q=4) - Correct after hesitation
 * 4: Easy (q=5) - Perfect response
 */
export function calculateSM2(card: SRSCard, quality: 1 | 2 | 3 | 4): SRSCard {
  // Translate 1-4 to SuperMemo 0-5 scale
  const qMap: Record<number, number> = { 1: 0, 2: 3, 3: 4, 4: 5 };
  const q = qMap[quality];

  let repetition = card.repetition;
  let interval = card.interval;
  let easeFactor = card.easeFactor;

  if (q >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // Calculate new Ease Factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 2.5) easeFactor = 2.5;

  const now = new Date();
  const nextDueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  const updatedCard: SRSCard = {
    ...card,
    repetition,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: nextDueDate.toISOString(),
    lastReviewedDate: now.toISOString(),
    history: [
      ...(card.history || []),
      { date: now.toISOString(), grade: quality }
    ]
  };

  return updatedCard;
}

export async function createCardFromMistake(mistake: MistakeItem): Promise<SRSCard> {
  const card: SRSCard = {
    id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    userId: mistake.userId,
    dialect: mistake.dialect,
    frontText: mistake.userAttempt,
    backTextFa: `شکل صحیح: ${mistake.correctForm}\nتوضیح: ${mistake.explanationFa}`,
    backTextEn: `Correct: ${mistake.correctForm}\nExplanation: ${mistake.explanationEn}`,
    category: mistake.type === 'grammar' ? 'grammar' : 'vocabulary',
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    history: []
  };

  await appDB.saveSRSCard(card);
  return card;
}

export function isCardDue(card: SRSCard): boolean {
  const due = new Date(card.dueDate).getTime();
  const now = new Date().getTime();
  return due <= now;
}

export function getInitialDefaultCards(dialect: DialectCode): SRSCard[] {
  const now = new Date().toISOString();
  if (dialect === 'ar-IQ') {
    return [
      {
        id: 'iq-card-1',
        userId: 'default-user-id',
        dialect: 'ar-IQ',
        frontText: 'شلونك؟ / شلونچ؟ (Shlonak / Shlonich)',
        backTextFa: 'معنی: چطوری؟ (خطاب به مرد / زن در بغداد)',
        backTextEn: 'Meaning: How are you? (to male / female in Iraqi)',
        category: 'phrase',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      },
      {
        id: 'iq-card-2',
        userId: 'default-user-id',
        dialect: 'ar-IQ',
        frontText: 'هواية (Hwaya)',
        backTextFa: 'معنی: خیلی زیاد / فراوان',
        backTextEn: 'Meaning: Very much / A lot',
        category: 'vocabulary',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      },
      {
        id: 'iq-card-3',
        userId: 'default-user-id',
        dialect: 'ar-IQ',
        frontText: 'أكو / ماكو (Ako / Mako)',
        backTextFa: 'معنی: وجود دارد / وجود ندارد (هست / نیست)',
        backTextEn: 'Meaning: There is / There is not',
        category: 'vocabulary',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      }
    ];
  } else if (dialect === 'ar-LB') {
    return [
      {
        id: 'lb-card-1',
        userId: 'default-user-id',
        dialect: 'ar-LB',
        frontText: 'كيفك؟ / كيفيك؟ (Kifak / Kifik)',
        backTextFa: 'معنی: چطوری؟ (خطاب به مرد / زن در لهجه لبنانی)',
        backTextEn: 'Meaning: How are you? (m/f in Lebanese)',
        category: 'phrase',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      },
      {
        id: 'lb-card-2',
        userId: 'default-user-id',
        dialect: 'ar-LB',
        frontText: 'تكرم عينك (Tekram einak)',
        backTextFa: 'معنی: خواهش می‌کنم / با کمال میل / چشمت بی‌بلا',
        backTextEn: 'Meaning: You are welcome / With pleasure',
        category: 'phrase',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      }
    ];
  } else {
    return [
      {
        id: 'en-card-1',
        userId: 'default-user-id',
        dialect: 'en-US',
        frontText: 'How is it going?',
        backTextFa: 'معنی: اوضاع چطوره؟ / چطوری؟',
        backTextEn: 'Meaning: How are you doing?',
        category: 'phrase',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      },
      {
        id: 'en-card-2',
        userId: 'default-user-id',
        dialect: 'en-US',
        frontText: 'No worries',
        backTextFa: 'معنی: نگران نباش / خواهش می‌کنم',
        backTextEn: 'Meaning: Don\'t worry / You are welcome',
        category: 'vocabulary',
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: now,
        history: []
      }
    ];
  }
}
