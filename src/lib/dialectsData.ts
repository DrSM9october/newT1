import { DialectInfo, RoleplayScenario, LearningPath, Achievement } from '../types/dialect';

export const DIALECTS: Record<string, DialectInfo> = {
  'en-US': {
    code: 'en-US',
    nameEn: 'American English',
    nameFa: 'انگلیسی آمریکایی',
    nameNative: 'American English',
    flag: '🇺🇸',
    descriptionFa: 'لهجه استاندارد انگلیسی آمریکایی همراه با اصطلاحات روزمره و زبان محاوره‌ای.',
    descriptionEn: 'Standard General American English with modern slang and conversational idioms.',
    ttsVoiceLang: 'en-US',
    phonemeMap: {
      'æ': 'cat, map (صدای "اَ" کوتاه)',
      'ɑ': 'father, hot (صدای "آ" باز)',
      'ɝ': 'bird, learn (صدای "اِر" رتیک)',
      'θ': 'think, math (صدای "ث" بی‌صدا)',
      'ð': 'this, mother (صدای "ذ" باصدا)',
      'ŋ': 'sing, long (صدای "نگ")',
      'ʃ': 'she, wish (صدای "ش")',
      'ʒ': 'vision, measure (صدای "ژ")',
      'tʃ': 'chair, catch (صدای "چ")',
      'dʒ': 'job, page (صدای "ج")'
    },
    commonVocabulary: [
      { term: 'How is it going?', meaningFa: 'اوضاع چطوره؟', meaningEn: 'How are you?', example: 'Hey bro, how is it going today?', audioHint: 'how-iz-it-going' },
      { term: 'No worries', meaningFa: 'نگران نباش / خواهش می‌کنم', meaningEn: 'You are welcome / Don\'t worry', example: 'Thanks for helping! - No worries at all.', audioHint: 'no-worries' },
      { term: 'Grab a bite', meaningFa: 'یه چیزی خوردن', meaningEn: 'Eat something quick', example: 'Let us grab a bite before the film starts.', audioHint: 'grab-a-bite' },
      { term: 'Hit me up', meaningFa: 'بام تماس بگیر / بهم پیام بده', meaningEn: 'Contact me', example: 'Hit me up when you arrive in New York.', audioHint: 'hit-me-up' },
      { term: 'Catch up', meaningFa: 'دیدار و تازه کردن اخبار', meaningEn: 'Get updated on news', example: 'We should catch up over coffee this weekend!', audioHint: 'catch-up' },
      { term: 'I am down', meaningFa: 'پایه‌ام / موافقم', meaningEn: 'I agree / I want to join', example: 'Want to go hiking? - Yeah, I am down!', audioHint: 'i-am-down' },
      { term: 'Bummer', meaningFa: 'حیف شد / حالمو گرفت', meaningEn: 'A disappointment', example: 'The concert was cancelled. That is a total bummer.', audioHint: 'bummer' },
      { term: 'Wrap up', meaningFa: 'جمع‌وجور کردن / تموم کردن', meaningEn: 'Finish or conclude', example: 'Let us wrap up the meeting in 5 minutes.', audioHint: 'wrap-up' }
    ],
    systemPromptTemplate: `You are an expert tutor in General American English (en-US). Speak clearly, naturally, and encourage the learner with friendly feedback. Use common American expressions, phrasal verbs, and mild slang appropriate for a natural conversation. When corrections are needed, point out grammar, pronunciation nuances, or word choice gently in both English and Persian.`
  },

  'ar-IQ': {
    code: 'ar-IQ',
    nameEn: 'Iraqi Arabic',
    nameFa: 'عربی عراقی (اللهجة العراقية)',
    nameNative: 'اللهجة العراقية',
    flag: '🇮🇶',
    descriptionFa: 'لهجه بومی عراق (بغدادی و جنوبی) با کلمات کاربردی مانند شلونك، هواية، اكو، هسه و گ/چ/پ.',
    descriptionEn: 'Iraqi Mesopotamian dialect (Baghdadi) featuring distinct vocabulary like Shlonak, Hwaya, Ako, and Hassa.',
    ttsVoiceLang: 'ar-XA',
    phonemeMap: {
      'گ (g)': 'صدای "گ" فارسی در کلمات عراقی (مثل: گال = گفت)',
      'چ (ch)': 'صدای "چ" فارسی در کلمات عراقی (مثل: شلونچ = چطوری بانوی من)',
      'پ (p)': 'صدای "پ" فارسی (مثل: پنجر = پنچر)',
      'ق (q -> g)': 'در بیشتر واژگان عراقی حرف "ق" به صورت "گ" تلفظ می‌شود',
      'ك (k -> ch)': 'در برخی ساختارهای خطاب مونث "ک" به "چ" تبدیل می‌شود'
    },
    commonVocabulary: [
      { term: 'شلونك؟ / شلونچ؟', transliteration: 'Shlonak? / Shlonich?', meaningFa: 'چطوری؟ (مذکر / مونث)', meaningEn: 'How are you? (m/f)', example: 'هلا بيك، شلونك عيني؟', audioHint: 'shlonak' },
      { term: 'هواية', transliteration: 'Hwaya', meaningFa: 'خیلی / زیاد', meaningEn: 'A lot / Very much', example: 'أحب العراق هواية.', audioHint: 'hwaya' },
      { term: 'أكو / ماكو', transliteration: 'Ako / Mako', meaningFa: 'هست / نیست (وجود دارد / ندارد)', meaningEn: 'There is / There is not', example: 'أكو مجال تكعد هنا؟ ماكو مشكلة.', audioHint: 'ako-mako' },
      { term: 'هسّه', transliteration: 'Hassa', meaningFa: 'الان / همین حالا', meaningEn: 'Now / Right now', example: 'رح أجي هسّه.', audioHint: 'hassa' },
      { term: 'يمعود / يمعودة', transliteration: 'Yammowad', meaningFa: 'ای بابا! / ای دوست من!', meaningEn: 'Hey buddy / Oh man!', example: 'يمعود شبيك متوتر؟', audioHint: 'yammowad' },
      { term: 'دادا', transliteration: 'Dada', meaningFa: 'عزیزم / داداش / خواهرم', meaningEn: 'Dear / Sister / Brother', example: 'هلا دادا شلون الصحة؟', audioHint: 'dada' },
      { term: 'زين / زينة', transliteration: 'Zain / Zaina', meaningFa: 'خوب / خوبم', meaningEn: 'Good / Fine', example: 'الحمد لله، أني زين.', audioHint: 'zain' },
      { term: 'چاي خادر', transliteration: 'Chai Khader', meaningFa: 'چای دم‌کشیده عراقی', meaningEn: 'Strong Iraqi brewed tea', example: 'تعال اشرب چاي خادر وياية.', audioHint: 'chai-khader' },
      { term: 'عيني', transliteration: 'Einy', meaningFa: 'چشمم / عزیزم', meaningEn: 'My eye / My dear', example: 'تدلل عيني، خادم أني.', audioHint: 'einy' },
      { term: 'كلش', transliteration: 'Kullish', meaningFa: 'خیلی / فوق‌العاده', meaningEn: 'Extremely / Very', example: 'هذا الأكل كلش طيب.', audioHint: 'kullish' }
    ],
    systemPromptTemplate: `You are an authentic Iraqi Arabic native tutor speaking Baghdadi/Iraqi dialect (اللهجة العراقية). Always use genuine Iraqi vocabulary (e.g., شلونك، هواية، اكو/ماكو، هسه، كلش، تدلل، عيني). Provide transliterations when talking and help the user master Iraqi Arabic naturally. Provide explanations in both Persian and English.`
  },

  'ar-LB': {
    code: 'ar-LB',
    nameEn: 'Lebanese Arabic',
    nameFa: 'عربی لبنانی (اللهجة اللبنانية)',
    nameNative: 'اللهجة اللبنانية',
    flag: '🇱🇧',
    descriptionFa: 'لهجه شامی/لبنانی با لحن ملودیک و کلمات پرکاربرد نظیر كيفك، كتير، هلق، شو بيك، ع راسي.',
    descriptionEn: 'Lebanese Levantine dialect known for its soft melodic rhythm and words like Kifak, Ktir, Halaq, and Shoo.',
    ttsVoiceLang: 'ar-XA',
    phonemeMap: {
      'ق (q -> glottal stop)': 'حرف "ق" معمولاً تلفظ نمی‌شود و تبدیل به همزه یا وقفه صوتی می‌شود (مثل: قسماً -> أسمان)',
      'إمالة (Imala)': 'کلمات با مصوت "ه" یا "ا" به صدای "ئِ" کشیده متمایل می‌شوند (مثل: شو هيدا -> شو هيدي)',
      'ج (soft j)': 'حرف "ج" مانند "ژ" نرم فرانسوی تلفظ می‌شود',
      'ث -> ت / س': 'حرف "ث" معمولاً تبدیل به "ت" یا "س" می‌شود'
    },
    commonVocabulary: [
      { term: 'كيفك؟ / كيفيك؟', transliteration: 'Kifak? / Kifik?', meaningFa: 'چطوری؟ (مذکر / مونث)', meaningEn: 'How are you? (m/f)', example: 'هاي! كيفك اليوم؟ شو الأخبار؟', audioHint: 'kifak' },
      { term: 'كتير', transliteration: 'Ktir', meaningFa: 'خیلی', meaningEn: 'Very / A lot', example: 'مرسي كتير إلك!', audioHint: 'ktir' },
      { term: 'هلق', transliteration: 'Halaq', meaningFa: 'الان / الان دیگه', meaningEn: 'Now / Right now', example: 'عم بحكيك هلق.', audioHint: 'halaq' },
      { term: 'شو في ما في؟', transliteration: 'Shoo fi ma fi?', meaningFa: 'چه خبرها؟ چی داری چی نداری؟', meaningEn: 'What\'s up? What\'s going on?', example: 'اهلين يا حلو، شو في ما في؟', audioHint: 'shoo-fi-ma-fi' },
      { term: 'تكرم / تكرم عينك', transliteration: 'Tekram / Tekram einak', meaningFa: 'خواهش می‌کنم / قدمت روی چشم', meaningEn: 'You are welcome / With pleasure', example: 'بدي قهوة لو سمحت. - تكرم عينك!', audioHint: 'tekram' },
      { term: 'ع راسي', transliteration: 'A rasi', meaningFa: 'روی چشمم / مخلصم', meaningEn: 'On my head / At your service', example: 'ممكن تساعدني؟ - ع راسي يا خيي.', audioHint: 'a-rasi' },
      { term: 'مظبوط', transliteration: 'Mazboot', meaningFa: 'دقیقاً / درست است', meaningEn: 'Correct / Exactly', example: 'حكيك مظبوط ١٠٠٪.', audioHint: 'mazboot' },
      { term: 'عم (+ verb)', transliteration: 'Am (+ verb)', meaningFa: 'در حالِ (... انجام دادن)', meaningEn: 'Present continuous indicator', example: 'عم بدرس عربي لبناني.', audioHint: 'am-verb' },
      { term: 'شو هيدا؟', transliteration: 'Shoo hayda?', meaningFa: 'این چیه؟', meaningEn: 'What is this?', example: 'شو هيدا الأكل الطيب؟', audioHint: 'shoo-hayda' },
      { term: 'يلا', transliteration: 'Yalla', meaningFa: 'یالا / زود باش / بریم', meaningEn: 'Let\'s go / Come on', example: 'يلا نمشي هلق.', audioHint: 'yalla' }
    ],
    systemPromptTemplate: `You are a native Lebanese tutor speaking Levantine Lebanese dialect (اللهجة اللبنانية). Speak with a warm melodic Lebanese style using vocabulary like كيفك، كتير، هلق، تكرم، شو هيدا، مظبوط. Provide transliterated text for Lebanese phrases alongside Arabic script, and explain meanings in Persian and English.`
  }
};

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  // American English
  {
    id: 'sc-en-1',
    dialect: 'en-US',
    titleFa: 'سفارش قهوه در کافه نیویورک',
    titleEn: 'Ordering Coffee in NYC',
    categoryFa: 'روزمره & سفر',
    categoryEn: 'Daily & Travel',
    difficulty: 'A1',
    characterName: 'Alex',
    characterRoleFa: 'باریستای کافه خوش‌برخورد',
    characterRoleEn: 'Friendly Coffee Shop Barista',
    characterAvatar: '☕',
    contextDescriptionFa: 'شما وارد یک کافه محبوب در نیویورک شده‌اید و می‌خواهید یک نوشیدنی سفارشی دهید.',
    contextDescriptionEn: 'You entered a busy NYC coffee shop and want to order a customized drink.',
    initialPrompt: 'Hey there! Welcome to Central Perk Cafe. What can I get started for you today?',
    suggestedOpening: 'Hi! Can I get an iced oat milk latte, please?',
    keyPhrasesToUse: ['iced latte', 'to go', 'oat milk', 'extra shot', 'how much is it']
  },
  {
    id: 'sc-en-2',
    dialect: 'en-US',
    titleFa: 'مصاحبه شغلی شرکت فناوری',
    titleEn: 'Tech Job Interview',
    categoryFa: 'شغلی & تخصصی',
    categoryEn: 'Career & Business',
    difficulty: 'B2',
    characterName: 'Sarah Jenkins',
    characterRoleFa: 'مدیر ارشد استخدام',
    characterRoleEn: 'Senior Hiring Manager',
    characterAvatar: '💼',
    contextDescriptionFa: 'شما در مرحله دوم مصاحبه شغلی برای موقعیت توسعه‌دهنده نرم‌افزار هستید.',
    contextDescriptionEn: 'You are in round 2 of a job interview for a software engineer role.',
    initialPrompt: 'Welcome! Thanks for joining today. To start off, could you tell me a bit about a challenging project you recently worked on?',
    suggestedOpening: 'Sure! In my last project, I refactored our core system to improve performance...',
    keyPhrasesToUse: ['problem solving', 'team collaboration', 'scalable solution', 'tight deadline']
  },
  {
    id: 'sc-en-3',
    dialect: 'en-US',
    titleFa: 'چک‌این در هتل و درخواست اتاق با چشم‌انداز',
    titleEn: 'Hotel Check-in & Special Request',
    categoryFa: 'اقامت & گردشگری',
    categoryEn: 'Hospitality & Tourism',
    difficulty: 'A2',
    characterName: 'David',
    characterRoleFa: 'مسئول پذیرش هتل',
    characterRoleEn: 'Hotel Front Desk Agent',
    characterAvatar: '🏨',
    contextDescriptionFa: 'وارد هتل شده‌اید و می‌خواهید کارت اتاق را تحویل گرفته و درخواست اتاق در طبقات بالا کنید.',
    contextDescriptionEn: 'Checking into your hotel and requesting a quiet room on a high floor.',
    initialPrompt: 'Good evening! Welcome to the Grand Plaza Hotel. How may I assist you tonight?',
    suggestedOpening: 'Hi, I have a reservation under my name. Is it possible to get a room on a higher floor?',
    keyPhrasesToUse: ['reservation under', 'high floor', 'city view', 'checkout time', 'Wi-Fi password']
  },

  // Iraqi Arabic
  {
    id: 'sc-iq-1',
    dialect: 'ar-IQ',
    titleFa: 'سفارش چای عراقی و باقلا بالدهن در قهوه‌خانه بغداد',
    titleEn: 'Ordering Iraqi Tea in Baghdad Cafe',
    categoryFa: 'فرهنگ & خوراکی',
    categoryEn: 'Culture & Dining',
    difficulty: 'A1',
    characterName: 'أبو أحمد (Abu Ahmad)',
    characterRoleFa: 'چای‌چی و صاحب قهوه‌خانه سنتی',
    characterRoleEn: 'Traditional Tea House Owner',
    characterAvatar: '🫖',
    contextDescriptionFa: 'در قهوه‌خانه سنتی شارع المتنبي بغداد نشسته‌اید و می‌خواهید چای استکان سنگین دم‌کشیده سفارش دهید.',
    contextDescriptionEn: 'Sitting at a historic cafe on Al-Mutanabbi street in Baghdad ordering brewed Iraqi tea.',
    initialPrompt: 'يا هلا ويا مرحب بدادنا! تفضل استريح، شلونك اليوم؟ شنو تحب تشرب؟',
    suggestedOpening: 'هلا بيك عمي أبو أحمد! أني زين الحمد لله. جيبلي استكان چاي خادر وهيل هسّه.',
    keyPhrasesToUse: ['چاي خادر', 'شلونك دادا', 'هواية ممنون', 'أكو مجال', 'كلش طيب']
  },
  {
    id: 'sc-iq-2',
    dialect: 'ar-IQ',
    titleFa: 'کرایه تاکسی در فرودگاه نجف یا بغداد',
    titleEn: 'Taking a Taxi from Baghdad Airport',
    categoryFa: 'حمل‌ونقل & سفر',
    categoryEn: 'Transport & Travel',
    difficulty: 'A2',
    characterName: 'أبو علي (Abu Ali)',
    characterRoleFa: 'راننده تاکسی بغدادی',
    characterRoleEn: 'Baghdadi Taxi Driver',
    characterAvatar: '🚕',
    contextDescriptionFa: 'از فرودگاه خارج شده‌اید و می‌خواهید چانه‌زنی کرده و تا مرکز شهر تاکسی بگیرید.',
    contextDescriptionEn: 'Hailing a taxi outside the airport and negotiating a price to city center.',
    initialPrompt: 'أهلاً وسهلاً بيك أخي! الحمد لله على السلامة. وين وجهتك اليوم؟',
    suggestedOpening: 'الله يسلمك عيني! أريد أروح للمنصور. ببيش التوصيلة؟',
    keyPhrasesToUse: ['ببيش التوصيلة', 'أريد أروح', 'معود كسر السعر', 'أكو ازدحام', 'شكراً هواية']
  },
  {
    id: 'sc-iq-3',
    dialect: 'ar-IQ',
    titleFa: 'خرید ماهی سمک مسگوف عراقی',
    titleEn: 'Buying Iraqi Masgouf Fish',
    categoryFa: 'بازار & خریدهای روزمره',
    categoryEn: 'Shopping & Food',
    difficulty: 'B1',
    characterName: 'أبو سيف (Abu Saif)',
    characterRoleFa: 'ماهی‌گیر و کباب‌کننده سمک مسگوف',
    characterRoleEn: 'Masgouf Fish Chef',
    characterAvatar: '🐟',
    contextDescriptionFa: 'کنار رود دجله ایستاده‌اید تا بزرگ‌ترین ماهی مسگوف کباب‌شده را برای شام خانوادگی بخرید.',
    contextDescriptionEn: 'Ordering freshly grilled Masgouf fish by the Tigris river for family dinner.',
    initialPrompt: 'أهلاً وسهلاً! سمك شبوط زوري حديث من دجلة هسّه شويناه على الحطب. شكد وزن تحب؟',
    suggestedOpening: 'هلا أبو سيف! أريد سمكة وزن كليوين، وشويها زين خادمة للطيبين.',
    keyPhrasesToUse: ['سمك مسگوف', 'شوي على الحطب', 'شكد الحساب', 'كلش زكية', 'تدلل عيني']
  },

  // Lebanese Arabic
  {
    id: 'sc-lb-1',
    dialect: 'ar-LB',
    titleFa: 'سفارش مناقیش زعتر و صفيحة در نانوایی بیروت',
    titleEn: 'Ordering Manakish in Beirut Bakery',
    categoryFa: 'صبحانه & غذا',
    categoryEn: 'Food & Dining',
    difficulty: 'A1',
    characterName: 'جورج (Georges)',
    characterRoleFa: 'شاطر نانوایی منقوشه در الروشة',
    characterRoleEn: 'Beirut Bakery Baker',
    characterAvatar: '🥙',
    contextDescriptionFa: 'صبح زود است و بوی مناقیش داغ زعتر و جبنه تمام خیابان‌های بیروت را پر کرده است.',
    contextDescriptionEn: 'Early morning in Beirut ordering fresh hot Zaatar and Cheese Manakish.',
    initialPrompt: 'صباح الخير والورد! كيفك اليوم؟ شو بتحب تتروق؟ منقوشة زعتر ولا جبنة؟',
    suggestedOpening: 'صباح النور! أني منيح كتير. بدي وحدة زعتر مع خضرة ووحدة جبنة كشك لو سمحت.',
    keyPhrasesToUse: ['كيفك اليوم', 'بدي منقوشة', 'لو سمحت', 'تكرم عينك', 'كتير طيبة']
  },
  {
    id: 'sc-lb-2',
    dialect: 'ar-LB',
    titleFa: 'خرید لباس و چانه‌زنی در بازارهای بیروت',
    titleEn: 'Shopping & Bargaining in Souk Beirut',
    categoryFa: 'خرید & مد',
    categoryEn: 'Shopping & Fashion',
    difficulty: 'A2',
    characterName: 'ميريام (Myriam)',
    characterRoleFa: 'فروشنده بوتیک در الحمرا',
    characterRoleEn: 'Hamra Boutique Owner',
    characterAvatar: '🛍️',
    contextDescriptionFa: 'وارد یک بوتیک در خیابان الحمرا شده‌اید و درباره قیمت و سایز لباس سوال می‌پرسید.',
    contextDescriptionEn: 'Shopping in a trendy boutique in Hamra Street looking for stylish clothes.',
    initialPrompt: 'هاي! أهلاً وسهلاً فيكي بالبوتيك. عم تدوري على شي معين اليوم؟',
    suggestedOpening: 'هاي ميريام! كيفك؟ عم دور على جاكيت حلوة، قديش سعر هيدي؟',
    keyPhrasesToUse: ['عم دور على', 'قديش حقا', 'في قياس أصغر', 'كتير غالية', 'ع راسي']
  },
  {
    id: 'sc-lb-3',
    dialect: 'ar-LB',
    titleFa: 'رزرو میز و سفارش مزه لبنانی در رستوران ساحلی',
    titleEn: 'Reserving & Ordering Lebanese Mezza',
    categoryFa: 'رستوران & تشریفات',
    categoryEn: 'Dining & Hospitality',
    difficulty: 'B1',
    characterName: 'شربل (Charbel)',
    characterRoleFa: 'سرمهماندار رستوران ساحلی جبیل',
    characterRoleEn: 'Seaside Restaurant Head Waiter',
    characterAvatar: '🥗',
    contextDescriptionFa: 'شما با دوستانتان به رستوران معروف جبیل رفته‌اید تا تبوله، حمص و فتوش سفارش دهید.',
    contextDescriptionEn: 'Dining with friends at a famous seaside restaurant ordering authentic Lebanese mezza.',
    initialPrompt: 'مسا الخير وأهلاً وسهلاً بكم بفرن الشباك وجبيل! الطاولة جاهزة ع البحر. شو بتحبوا تبدأوا بالمقبلات؟',
    suggestedOpening: 'مسا النور شربل! بدنا صحن تبولة، حمص بطحينة، فتوش وورق عنب هلق.',
    keyPhrasesToUse: ['مزة لبنانية', 'تبولة وفتوش', 'ع البحر', 'شو بتنصحنا', 'تسلم إيديك']
  }
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'lp-1',
    dialect: 'en-US',
    titleFa: 'تسلط بر مکالمات روزمره آمریکایی',
    titleEn: 'Mastering Everyday American Speech',
    descriptionFa: 'یادگیری اصلاحات، افعال عبارتی و اصطلاحات خیابانی رایج در آمریکا.',
    descriptionEn: 'Learn idioms, phrasal verbs, and daily American expressions.',
    level: 'A1',
    icon: '🗽',
    stepsCount: 12,
    scenarios: ['sc-en-1', 'sc-en-3'],
    recommendedVocabulary: ['How is it going?', 'No worries', 'Catch up', 'I am down']
  },
  {
    id: 'lp-2',
    dialect: 'ar-IQ',
    titleFa: 'دوره‌ی فشرده اللهجة العراقية (بغداد و جنوب)',
    titleEn: 'Iraqi Dialect Crash Course',
    descriptionFa: 'یادگیری کلمات کلیدی، حروف گ/چ/پ و اصطلاحات صمیمانه عراقی.',
    descriptionEn: 'Master key Iraqi words, Baghdadi pronunciations and warm greetings.',
    level: 'A1',
    icon: '🇮🇶',
    stepsCount: 15,
    scenarios: ['sc-iq-1', 'sc-iq-2', 'sc-iq-3'],
    recommendedVocabulary: ['شلونك', 'هواية', 'أكو', 'ماكو', 'هسّه', 'كلش']
  },
  {
    id: 'lp-3',
    dialect: 'ar-LB',
    titleFa: 'مکالمه روان لبنانی و شامی',
    titleEn: 'Lebanese Levantine Fluency',
    descriptionFa: 'یادگیری لحن ملودیک لبنانی، اماله، و عبارت‌های کاربردی بیروت.',
    descriptionEn: 'Learn Lebanese rhythm, glottal stop pronunciation and polite street talk.',
    level: 'A1',
    icon: '🇱🇧',
    stepsCount: 14,
    scenarios: ['sc-lb-1', 'sc-lb-2', 'sc-lb-3'],
    recommendedVocabulary: ['كيفك', 'كتير', 'هلق', 'تكرم', 'شو هيدا']
  }
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'ach-first-step',
    titleFa: 'اولین قدم قدرتمند',
    titleEn: 'First Step',
    descFa: 'ارسال اولین پیام مکالمه با هوش مصنوعی',
    descEn: 'Send your first conversational message',
    icon: '🚀',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'ach-streak-7',
    titleFa: 'استمرار ۷ روزه',
    titleEn: '7-Day Streak',
    descFa: 'تمرین مداوم روزانه به مدت ۷ روز',
    descEn: 'Maintain a 7-day study streak',
    icon: '🔥',
    requiredStreak: 7,
    badgeColor: 'bg-amber-500'
  },
  {
    id: 'ach-dialect-master',
    titleFa: 'استاد لهجه‌ها',
    titleEn: 'Dialect Explorer',
    descFa: 'تمرین حداقل با ۲ لهجه مختلف (عراقی/لبنانی/انگلیسی)',
    descEn: 'Practice with at least 2 different dialects',
    icon: '🌍',
    badgeColor: 'bg-purple-500'
  },
  {
    id: 'ach-srs-20',
    titleFa: 'حافظه برتر SRS',
    titleEn: 'SRS Memory Master',
    descFa: 'مرور و تکرار ۲۰ کارت با سیستم SM-2',
    descEn: 'Review 20 cards using SM-2 algorithm',
    icon: '🧠',
    requiredCards: 20,
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'ach-voice-pro',
    titleFa: 'صداپیشه و تلفظ عالی',
    titleEn: 'Voice Native',
    descFa: 'کسب امتیاز بالای ۸۵ در سنجش تلفظ',
    descEn: 'Score over 85% in pronunciation lab',
    icon: '🎙️',
    badgeColor: 'bg-rose-500'
  },
  {
    id: 'ach-roleplay-hero',
    titleFa: 'قهرمان نقش‌آفرینی',
    titleEn: 'Roleplay Hero',
    descFa: 'تکمیل موفقیت‌آمیز ۳ سناریوی تعاملی',
    descEn: 'Complete 3 interactive roleplay scenarios',
    icon: '🎭',
    requiredScenarios: 3,
    badgeColor: 'bg-indigo-500'
  }
];
