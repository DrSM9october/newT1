import { UserProfile, ChatMessage, SRSCard, MistakeItem, PronunciationAttempt, UserMemory, AuditLog } from '../types/dialect';

const DB_NAME = 'DialectAIDB_v1';
const DB_VERSION = 1;

class AppDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Stores simulating the tables
        if (!db.objectStoreNames.contains('user_profile')) {
          db.createObjectStore('user_profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', { keyPath: 'id' });
          store.createIndex('conversationId', 'conversationId', { unique: false });
          store.createIndex('dialect', 'dialect', { unique: false });
        }
        if (!db.objectStoreNames.contains('srs_cards')) {
          const store = db.createObjectStore('srs_cards', { keyPath: 'id' });
          store.createIndex('dialect', 'dialect', { unique: false });
          store.createIndex('dueDate', 'dueDate', { unique: false });
        }
        if (!db.objectStoreNames.contains('mistakes')) {
          const store = db.createObjectStore('mistakes', { keyPath: 'id' });
          store.createIndex('dialect', 'dialect', { unique: false });
          store.createIndex('resolved', 'resolved', { unique: false });
        }
        if (!db.objectStoreNames.contains('pronunciation_attempts')) {
          const store = db.createObjectStore('pronunciation_attempts', { keyPath: 'id' });
          store.createIndex('dialect', 'dialect', { unique: false });
        }
        if (!db.objectStoreNames.contains('user_memory')) {
          db.createObjectStore('user_memory', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audit_logs')) {
          db.createObjectStore('audit_logs', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB init error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // --- Profile Operations ---
  async getUserProfile(): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      id: 'default-user-id',
      name: 'کاربر زبان‌آموز',
      activeDialect: 'en-US',
      level: 'A1',
      xp: 120,
      userLevel: 2,
      streakDays: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyXpGoal: 50,
      todayXp: 30,
      weeklyXpGoal: 350,
      completedScenarios: [],
      unlockedAchievements: ['ach-first-step'],
      theme: 'dark',
      uiLanguage: 'fa',
      aiModelPreference: 'hybrid-gemini',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      autoPlayAudio: true,
      offlineMode: false,
    };

    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('user_profile', 'readonly');
        const store = tx.objectStore('user_profile');
        const req = store.get('default-user-id');
        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result as UserProfile);
          } else {
            this.saveUserProfile(defaultProfile);
            resolve(defaultProfile);
          }
        };
        req.onerror = () => resolve(defaultProfile);
      });
    } catch (e) {
      return defaultProfile;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction('user_profile', 'readwrite');
      tx.objectStore('user_profile').put(profile);
    } catch (e) {
      console.warn('DB Save Profile Error:', e);
    }
  }

  // --- Messages Operations ---
  async getMessages(dialect: string): Promise<ChatMessage[]> {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');
        const index = store.index('dialect');
        const req = index.getAll(dialect);
        req.onsuccess = () => {
          resolve((req.result || []) as ChatMessage[]);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async addMessage(msg: ChatMessage): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction('messages', 'readwrite');
      tx.objectStore('messages').add(msg);
      this.logAudit('MESSAGE_SENT', `Dialect: ${msg.dialect}, Length: ${msg.text.length}`);
    } catch (e) {
      console.warn('DB Add Message Error:', e);
    }
  }

  // --- SRS Operations ---
  async getSRSCards(dialect?: string): Promise<SRSCard[]> {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('srs_cards', 'readonly');
        const store = tx.objectStore('srs_cards');
        const req = store.getAll();
        req.onsuccess = () => {
          const cards = (req.result || []) as SRSCard[];
          if (dialect) {
            resolve(cards.filter(c => c.dialect === dialect));
          } else {
            resolve(cards);
          }
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async saveSRSCard(card: SRSCard): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction('srs_cards', 'readwrite');
      tx.objectStore('srs_cards').put(card);
    } catch (e) {
      console.warn('DB Save SRS Card error:', e);
    }
  }

  // --- Mistakes Operations ---
  async getMistakes(dialect?: string): Promise<MistakeItem[]> {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('mistakes', 'readonly');
        const store = tx.objectStore('mistakes');
        const req = store.getAll();
        req.onsuccess = () => {
          const mistakes = (req.result || []) as MistakeItem[];
          if (dialect) {
            resolve(mistakes.filter(m => m.dialect === dialect));
          } else {
            resolve(mistakes);
          }
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async addMistake(mistake: MistakeItem): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction('mistakes', 'readwrite');
      tx.objectStore('mistakes').put(mistake);
    } catch (e) {
      console.warn('DB Add Mistake error:', e);
    }
  }

  // --- Pronunciation Attempts ---
  async addPronunciationAttempt(attempt: PronunciationAttempt): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction('pronunciation_attempts', 'readwrite');
      tx.objectStore('pronunciation_attempts').add(attempt);
    } catch (e) {
      console.warn('DB Add Pronunciation attempt error:', e);
    }
  }

  async getPronunciationHistory(dialect?: string): Promise<PronunciationAttempt[]> {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('pronunciation_attempts', 'readonly');
        const store = tx.objectStore('pronunciation_attempts');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as PronunciationAttempt[];
          if (dialect) {
            resolve(list.filter(p => p.dialect === dialect));
          } else {
            resolve(list);
          }
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  // --- Audit Logging ---
  async logAudit(action: string, details: string): Promise<void> {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    try {
      const db = await this.init();
      const tx = db.transaction('audit_logs', 'readwrite');
      tx.objectStore('audit_logs').add(log);
    } catch (e) {
      // quiet fallback
    }
  }

  // --- Backup & Export ---
  async exportAllData(): Promise<string> {
    const profile = await this.getUserProfile();
    const cards = await this.getSRSCards();
    const mistakes = await this.getMistakes();
    const pronunciation = await this.getPronunciationHistory();

    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      cards,
      mistakes,
      pronunciation,
    };

    return JSON.stringify(backupObj, null, 2);
  }

  async restoreData(jsonStr: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) await this.saveUserProfile(parsed.profile);
      if (Array.isArray(parsed.cards)) {
        for (const card of parsed.cards) await this.saveSRSCard(card);
      }
      if (Array.isArray(parsed.mistakes)) {
        for (const m of parsed.mistakes) await this.addMistake(m);
      }
      return true;
    } catch (e) {
      console.error('Failed to restore database:', e);
      return false;
    }
  }
}

export const appDB = new AppDatabase();
