PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,phone TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,language TEXT NOT NULL CHECK(language IN ('rw','en','fr')),created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL UNIQUE,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS groups(id TEXT PRIMARY KEY,name TEXT NOT NULL,state_json TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS memberships(group_id TEXT NOT NULL REFERENCES groups(id),user_id TEXT NOT NULL REFERENCES users(id),role TEXT NOT NULL CHECK(role IN ('chairperson','treasurer','secretary','member')),joined_at INTEGER NOT NULL,PRIMARY KEY(group_id,user_id));
CREATE TABLE IF NOT EXISTS invitations(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL UNIQUE,group_id TEXT NOT NULL REFERENCES groups(id),phone TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('treasurer','secretary','member')),created_by TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL,used_by TEXT REFERENCES users(id),used_at INTEGER);
CREATE TABLE IF NOT EXISTS requests(user_id TEXT NOT NULL REFERENCES users(id),group_id TEXT NOT NULL REFERENCES groups(id),request_key TEXT NOT NULL,body_hash TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(user_id,group_id,request_key));
CREATE TABLE IF NOT EXISTS journal(id TEXT PRIMARY KEY,group_id TEXT NOT NULL REFERENCES groups(id),source TEXT NOT NULL,created_at INTEGER NOT NULL,UNIQUE(group_id,source));
CREATE TABLE IF NOT EXISTS journal_lines(id INTEGER PRIMARY KEY,journal_id TEXT NOT NULL REFERENCES journal(id),account TEXT NOT NULL,member_id TEXT REFERENCES users(id),debit INTEGER NOT NULL DEFAULT 0 CHECK(debit>=0),credit INTEGER NOT NULL DEFAULT 0 CHECK(credit>=0),CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0)));
CREATE TABLE IF NOT EXISTS auth_attempts(bucket TEXT NOT NULL,at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS auth_attempts_bucket ON auth_attempts(bucket,at);
PRAGMA user_version=4;

CREATE TABLE IF NOT EXISTS phone_challenges(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),phone_hash TEXT NOT NULL,ip_hash TEXT NOT NULL,purpose TEXT NOT NULL CHECK(purpose IN ('verify','reset')),code_digest TEXT NOT NULL,issued_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,delivered INTEGER NOT NULL DEFAULT 0,consumed_at INTEGER);
CREATE INDEX IF NOT EXISTS phone_challenges_limits ON phone_challenges(phone_hash,purpose,issued_at);
CREATE INDEX IF NOT EXISTS phone_challenges_ip ON phone_challenges(ip_hash,issued_at);
CREATE TABLE IF NOT EXISTS security_events(id INTEGER PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),event TEXT NOT NULL,created_at INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS receipts(id TEXT PRIMARY KEY,group_id TEXT NOT NULL REFERENCES groups(id),owner_id TEXT NOT NULL REFERENCES users(id),payment_id TEXT,filename TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,bytes BLOB NOT NULL,created_at INTEGER NOT NULL,upload_key TEXT NOT NULL,content_hash TEXT NOT NULL,UNIQUE(group_id,owner_id,upload_key));
CREATE TABLE IF NOT EXISTS notification_reads(group_id TEXT NOT NULL REFERENCES groups(id),user_id TEXT NOT NULL REFERENCES users(id),notification_id TEXT NOT NULL,read_at INTEGER NOT NULL,PRIMARY KEY(group_id,user_id,notification_id));

CREATE TABLE IF NOT EXISTS receipt_upload_events(group_id TEXT NOT NULL,user_id TEXT NOT NULL,created_at INTEGER NOT NULL);
