import Database from "better-sqlite3"; import fs from "node:fs"; import path from "node:path";
const file=process.env.DATABASE_PATH||"./data/linguaai.sqlite"; fs.mkdirSync(path.dirname(file),{recursive:true});
export const db=new Database(file); db.pragma("journal_mode=WAL"); db.pragma("foreign_keys=ON");
const tables=[
["users","id TEXT PRIMARY KEY,name TEXT,email TEXT,dialect TEXT NOT NULL DEFAULT 'american',level TEXT NOT NULL DEFAULT 'A1',xp INTEGER DEFAULT 0,created_at TEXT,updated_at TEXT"],
["user_memory","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,memory_key TEXT,memory_value TEXT,importance REAL DEFAULT .5,updated_at TEXT,UNIQUE(user_id,memory_key)"],
["conversations","id TEXT PRIMARY KEY,user_id TEXT,dialect TEXT,level TEXT,mode TEXT,title TEXT,summary TEXT,created_at TEXT,updated_at TEXT"],
["messages","id TEXT PRIMARY KEY,conversation_id TEXT,role TEXT,content TEXT,created_at TEXT"],
["conversation_summaries","id INTEGER PRIMARY KEY AUTOINCREMENT,conversation_id TEXT,summary TEXT,created_at TEXT"],
["vocabulary","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,dialect TEXT,word TEXT,translation TEXT,example TEXT,part_of_speech TEXT,level TEXT,source TEXT,created_at TEXT,UNIQUE(user_id,dialect,word)"],
["srs_cards","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,vocabulary_id INTEGER,due_at TEXT,interval_days REAL DEFAULT 0,ease_factor REAL DEFAULT 2.5,repetitions INTEGER DEFAULT 0,lapses INTEGER DEFAULT 0,last_quality INTEGER,updated_at TEXT"],
["mistakes","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,conversation_id TEXT,category TEXT,source_text TEXT,correction TEXT,explanation TEXT,count INTEGER DEFAULT 1,resolved INTEGER DEFAULT 0,last_seen TEXT"],
["pronunciation_attempts","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,dialect TEXT,target_text TEXT,transcript TEXT,score REAL,phoneme_errors TEXT,problem_words TEXT,created_at TEXT"],
["learning_progress","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,skill TEXT,value REAL DEFAULT 0,attempts INTEGER DEFAULT 0,updated_at TEXT,UNIQUE(user_id,skill)"],
["achievements","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,code TEXT,unlocked_at TEXT,UNIQUE(user_id,code)"],
["streaks","user_id TEXT PRIMARY KEY,current_days INTEGER DEFAULT 0,best_days INTEGER DEFAULT 0,last_activity_date TEXT"],
["daily_goals","user_id TEXT,goal_date TEXT,minutes_target INTEGER DEFAULT 15,minutes_done INTEGER DEFAULT 0,xp_target INTEGER DEFAULT 50,xp_done INTEGER DEFAULT 0,PRIMARY KEY(user_id,goal_date)"],
["weekly_goals","user_id TEXT,week_start TEXT,xp_target INTEGER DEFAULT 300,xp_done INTEGER DEFAULT 0,PRIMARY KEY(user_id,week_start)"],
["imported_content","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,type TEXT,title TEXT,source TEXT,content TEXT,created_at TEXT"],
["audit_logs","id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,action TEXT,metadata TEXT,created_at TEXT"],
["learning_paths","id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT UNIQUE,name TEXT,description TEXT,dialect TEXT,level TEXT"],
["path_progress","user_id TEXT,path_id INTEGER,progress REAL DEFAULT 0,updated_at TEXT,PRIMARY KEY(user_id,path_id)"],
["scenarios","id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT UNIQUE,dialect TEXT,title TEXT,context TEXT,difficulty INTEGER"],
["scenario_steps","id INTEGER PRIMARY KEY AUTOINCREMENT,scenario_id INTEGER,step_no INTEGER,speaker TEXT,text TEXT,expected_intent TEXT"],
["scenario_progress","user_id TEXT,scenario_id INTEGER,completed INTEGER DEFAULT 0,score REAL DEFAULT 0,updated_at TEXT,PRIMARY KEY(user_id,scenario_id)"],
["interactive_exercises","id INTEGER PRIMARY KEY AUTOINCREMENT,dialect TEXT,level TEXT,type TEXT,prompt TEXT,answer TEXT,metadata TEXT"],
["badges","id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT UNIQUE,name TEXT,description TEXT,xp_reward INTEGER DEFAULT 0"],
["user_badges","user_id TEXT,badge_id INTEGER,awarded_at TEXT,PRIMARY KEY(user_id,badge_id)"],
["pronunciation_progress","user_id TEXT,dialect TEXT,phoneme TEXT,score REAL DEFAULT 0,attempts INTEGER DEFAULT 0,updated_at TEXT,PRIMARY KEY(user_id,dialect,phoneme)"],
["roleplay_sessions","id TEXT PRIMARY KEY,user_id TEXT,scenario_id INTEGER,character TEXT,difficulty INTEGER,status TEXT,started_at TEXT,ended_at TEXT"],
["leaderboard_scores","user_id TEXT PRIMARY KEY,season TEXT,xp INTEGER DEFAULT 0,updated_at TEXT"],
["sync_queue","id INTEGER PRIMARY KEY AUTOINCREMENT,entity TEXT,entity_id TEXT,operation TEXT,payload TEXT,created_at TEXT,synced_at TEXT"]
];
export function migrate(){db.exec("CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY,applied_at TEXT)"); const n=(db.prepare("SELECT MAX(version) v FROM schema_migrations").get() as any)?.v||0; const tx=db.transaction(()=>tables.forEach(([name,cols],i)=>{const v=i+1;if(v>n){db.exec(`CREATE TABLE IF NOT EXISTS ${name}(${cols})`);db.prepare("INSERT INTO schema_migrations VALUES(?,?)").run(v,new Date().toISOString())}}));tx();}
migrate();
export function getContext(id:string,n=20){return db.prepare("SELECT role,content,created_at FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT ?").all(id,n).reverse() as any[]}
export function memory(id:string,n=12){return db.prepare("SELECT memory_key,memory_value,importance FROM user_memory WHERE user_id=? ORDER BY importance DESC,updated_at DESC LIMIT ?").all(id,n) as any[]}
