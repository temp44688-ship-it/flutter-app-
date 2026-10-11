PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patient_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  given_name TEXT NOT NULL CHECK (length(trim(given_name)) > 0),
  family_name TEXT NOT NULL CHECK (length(trim(family_name)) > 0),
  birth_date_ms INTEGER,
  biological_sex TEXT CHECK (biological_sex IN ('female', 'male', 'intersex', 'unspecified')),
  phone TEXT, email TEXT, emergency_contact_name TEXT, emergency_contact_phone TEXT, notes TEXT,
  created_at_ms INTEGER NOT NULL, updated_at_ms INTEGER NOT NULL, deleted_at_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_family_name ON patient_profiles (family_name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_updated_at ON patient_profiles (updated_at_ms);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY NOT NULL,
  patient_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  dosage TEXT NOT NULL CHECK (length(trim(dosage)) > 0),
  frequency TEXT NOT NULL CHECK (length(trim(frequency)) > 0),
  route TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'STOPPED', 'COMPLETED')),
  start_date_ms INTEGER NOT NULL,
  end_date_ms INTEGER,
  notes TEXT,
  supersedes_id TEXT REFERENCES medications(id) ON DELETE RESTRICT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  stopped_at_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_medications_patient_status ON medications(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_medications_updated_at ON medications(updated_at_ms);

CREATE VIRTUAL TABLE IF NOT EXISTS medical_fts USING fts5(
  entity_type UNINDEXED,
  entity_id UNINDEXED,
  patient_id UNINDEXED,
  content_text,
  tokenize = 'unicode61 remove_diacritics 2'
);
CREATE TRIGGER IF NOT EXISTS medications_ai AFTER INSERT ON medications BEGIN
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('medication', new.id, new.patient_id, trim(new.name || ' ' || new.dosage || ' ' || new.frequency || ' ' || coalesce(new.route, '') || ' ' || new.status || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS medications_au AFTER UPDATE ON medications BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'medication' AND entity_id = old.id;
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('medication', new.id, new.patient_id, trim(new.name || ' ' || new.dosage || ' ' || new.frequency || ' ' || coalesce(new.route, '') || ' ' || new.status || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS medications_ad AFTER DELETE ON medications BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'medication' AND entity_id = old.id;
END;

CREATE TABLE IF NOT EXISTS diseases (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY NOT NULL,
  patient_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  physician_name TEXT NOT NULL CHECK (length(trim(physician_name)) > 0),
  specialty TEXT NOT NULL CHECK (length(trim(specialty)) > 0),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  diagnosis TEXT,
  notes TEXT,
  consultation_date_ms INTEGER NOT NULL,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS consultation_diseases (
  consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  disease_id TEXT NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
  PRIMARY KEY (consultation_id, disease_id)
);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations(patient_id, consultation_date_ms DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_diseases_disease ON consultation_diseases(disease_id);

CREATE TRIGGER IF NOT EXISTS consultations_ai AFTER INSERT ON consultations BEGIN
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('consultation', new.id, new.patient_id, trim(new.physician_name || ' ' || new.specialty || ' ' || new.reason || ' ' || coalesce(new.diagnosis, '') || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS consultations_au AFTER UPDATE ON consultations BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'consultation' AND entity_id = old.id;
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('consultation', new.id, new.patient_id, trim(new.physician_name || ' ' || new.specialty || ' ' || new.reason || ' ' || coalesce(new.diagnosis, '') || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS consultations_ad AFTER DELETE ON consultations BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'consultation' AND entity_id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS consultation_diseases_ai AFTER INSERT ON consultation_diseases BEGIN
  UPDATE consultations SET updated_at_ms = updated_at_ms WHERE id = new.consultation_id;
END;
CREATE TRIGGER IF NOT EXISTS consultation_diseases_ad AFTER DELETE ON consultation_diseases BEGIN
  UPDATE consultations SET updated_at_ms = updated_at_ms WHERE id = old.consultation_id;
END;

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY NOT NULL,
  patient_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL,
  medication_name TEXT NOT NULL CHECK (length(trim(medication_name)) > 0),
  dosage TEXT,
  instructions TEXT,
  prescribed_date_ms INTEGER NOT NULL,
  notes TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY NOT NULL,
  patient_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL,
  prescription_id TEXT REFERENCES prescriptions(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL CHECK (length(trim(file_name)) > 0),
  mime_type TEXT NOT NULL,
  file_uri TEXT NOT NULL,
  file_size_bytes INTEGER,
  notes TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_date ON prescriptions(patient_id, prescribed_date_ms DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_patient_created ON attachments(patient_id, created_at_ms DESC);
CREATE TRIGGER IF NOT EXISTS prescriptions_ai AFTER INSERT ON prescriptions BEGIN
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('prescription', new.id, new.patient_id, trim(new.medication_name || ' ' || coalesce(new.dosage, '') || ' ' || coalesce(new.instructions, '') || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS prescriptions_au AFTER UPDATE ON prescriptions BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'prescription' AND entity_id = old.id;
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('prescription', new.id, new.patient_id, trim(new.medication_name || ' ' || coalesce(new.dosage, '') || ' ' || coalesce(new.instructions, '') || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS prescriptions_ad AFTER DELETE ON prescriptions BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'prescription' AND entity_id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS attachments_ai AFTER INSERT ON attachments BEGIN
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('attachment', new.id, new.patient_id, trim(new.file_name || ' ' || new.mime_type || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS attachments_au AFTER UPDATE ON attachments BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'attachment' AND entity_id = old.id;
  INSERT INTO medical_fts(entity_type, entity_id, patient_id, content_text)
  VALUES ('attachment', new.id, new.patient_id, trim(new.file_name || ' ' || new.mime_type || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS attachments_ad AFTER DELETE ON attachments BEGIN
  DELETE FROM medical_fts WHERE entity_type = 'attachment' AND entity_id = old.id;
END;

CREATE VIRTUAL TABLE IF NOT EXISTS patient_profiles_fts USING fts5(patient_id UNINDEXED, content_text, tokenize = 'unicode61 remove_diacritics 2');
CREATE TRIGGER IF NOT EXISTS patient_profiles_ai AFTER INSERT ON patient_profiles BEGIN
  INSERT INTO patient_profiles_fts(patient_id, content_text) VALUES (new.id, trim(new.given_name || ' ' || new.family_name || ' ' || coalesce(new.phone, '') || ' ' || coalesce(new.email, '') || ' ' || coalesce(new.emergency_contact_name, '') || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS patient_profiles_au AFTER UPDATE ON patient_profiles BEGIN
  DELETE FROM patient_profiles_fts WHERE patient_id = old.id;
  INSERT INTO patient_profiles_fts(patient_id, content_text) VALUES (new.id, trim(new.given_name || ' ' || new.family_name || ' ' || coalesce(new.phone, '') || ' ' || coalesce(new.email, '') || ' ' || coalesce(new.emergency_contact_name, '') || ' ' || coalesce(new.notes, '')));
END;
CREATE TRIGGER IF NOT EXISTS patient_profiles_ad AFTER DELETE ON patient_profiles BEGIN
  DELETE FROM patient_profiles_fts WHERE patient_id = old.id;
END;
