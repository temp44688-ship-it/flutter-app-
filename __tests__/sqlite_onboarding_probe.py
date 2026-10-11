import json
import sqlite3
from pathlib import Path

DDL = Path(__file__).parent.parent.joinpath('src', 'database', 'schema_ddl.sql').read_text()

def insert_patient(con, patient_id, allergy):
    con.execute('''INSERT INTO patient_profiles (id, given_name, family_name, birth_date_ms, biological_sex, blood_group, major_allergies, phone, email, emergency_contact_name, emergency_contact_phone, notes, created_at_ms, updated_at_ms, deleted_at_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (patient_id, 'Ada', 'Lovelace', 1, None, 'O+', allergy, None, None, 'Grace', '01', None, 1, 1, None))

def migrate_legacy(con):
    names = {row[1] for row in con.execute('PRAGMA table_info(patient_profiles)')}
    if 'blood_group' not in names:
        con.execute("ALTER TABLE patient_profiles ADD COLUMN blood_group TEXT NOT NULL DEFAULT 'unknown'")
    if 'major_allergies' not in names:
        con.execute('ALTER TABLE patient_profiles ADD COLUMN major_allergies TEXT')
    con.executescript('''DROP TRIGGER IF EXISTS patient_profiles_ai; DROP TRIGGER IF EXISTS patient_profiles_au;
    CREATE TRIGGER patient_profiles_ai AFTER INSERT ON patient_profiles BEGIN INSERT INTO patient_profiles_fts(patient_id, content_text) VALUES (new.id, trim(new.given_name || ' ' || new.family_name || ' ' || coalesce(new.blood_group, '') || ' ' || coalesce(new.major_allergies, '') || ' ' || coalesce(new.phone, '') || ' ' || coalesce(new.email, '') || ' ' || coalesce(new.emergency_contact_name, '') || ' ' || coalesce(new.notes, ''))); END;
    CREATE TRIGGER patient_profiles_au AFTER UPDATE ON patient_profiles BEGIN DELETE FROM patient_profiles_fts WHERE patient_id = old.id; INSERT INTO patient_profiles_fts(patient_id, content_text) VALUES (new.id, trim(new.given_name || ' ' || new.family_name || ' ' || coalesce(new.blood_group, '') || ' ' || coalesce(new.major_allergies, '') || ' ' || coalesce(new.phone, '') || ' ' || coalesce(new.email, '') || ' ' || coalesce(new.emergency_contact_name, '') || ' ' || coalesce(new.notes, ''))); END;''')

def fresh_case():
    con = sqlite3.connect(':memory:')
    con.execute('PRAGMA foreign_keys=ON')
    con.executescript(DDL)
    insert_patient(con, 'fresh', 'Pénicilline')
    profile = con.execute('SELECT blood_group, major_allergies FROM patient_profiles WHERE id=?', ('fresh',)).fetchone()
    hit = con.execute("SELECT patient_id FROM patient_profiles_fts WHERE patient_profiles_fts MATCH ?", ('Pénicilline',)).fetchone()
    assert profile == ('O+', 'Pénicilline') and hit == ('fresh',)
    con.close()

def legacy_case():
    con = sqlite3.connect(':memory:')
    con.execute('PRAGMA foreign_keys=ON')
    con.execute('''CREATE TABLE patient_profiles (id TEXT PRIMARY KEY NOT NULL, given_name TEXT NOT NULL, family_name TEXT NOT NULL, birth_date_ms INTEGER, biological_sex TEXT, phone TEXT, email TEXT, emergency_contact_name TEXT, emergency_contact_phone TEXT, notes TEXT, created_at_ms INTEGER NOT NULL, updated_at_ms INTEGER NOT NULL, deleted_at_ms INTEGER)''')
    con.executescript(DDL)
    migrate_legacy(con)
    insert_patient(con, 'legacy', 'Latex')
    names = {row[1] for row in con.execute('PRAGMA table_info(patient_profiles)')}
    hit = con.execute("SELECT patient_id FROM patient_profiles_fts WHERE patient_profiles_fts MATCH ?", ('Latex',)).fetchone()
    assert {'blood_group', 'major_allergies'} <= names and hit == ('legacy',)
    con.close()

def entity_case():
    con = sqlite3.connect(':memory:')
    con.execute('PRAGMA foreign_keys=ON')
    con.executescript(DDL)
    insert_patient(con, 'p', 'None')
    con.execute("INSERT INTO medications (id, patient_id, name, dosage, frequency, status, start_date_ms, created_at_ms, updated_at_ms) VALUES (?,?,?,?,?,?,?,?,?)", ('m', 'p', 'Amlodipine', '5 mg', 'Matin', 'ACTIVE', 1, 1, 1))
    con.execute("INSERT INTO consultations (id, patient_id, physician_name, specialty, reason, diagnosis, notes, consultation_date_ms, created_at_ms, updated_at_ms) VALUES (?,?,?,?,?,?,?,?,?,?)", ('c', 'p', 'Dr Ahmed', 'Cardiologue', 'Douleur', 'Hypertension', 'Suivi', 1, 1, 1))
    con.execute("INSERT INTO prescriptions (id, patient_id, medication_name, prescribed_date_ms, created_at_ms, updated_at_ms) VALUES (?,?,?,?,?,?)", ('r', 'p', 'Amlodipine', 1, 1, 1))
    con.execute("INSERT INTO attachments (id, patient_id, file_name, mime_type, file_uri, created_at_ms, updated_at_ms) VALUES (?,?,?,?,?,?,?)", ('a', 'p', 'ordonnance.pdf', 'application/pdf', 'file:///private/a', 1, 1))
    entities = {row[0] for row in con.execute('SELECT entity_type FROM medical_fts')}
    assert {'attachment', 'consultation', 'medication', 'prescription'} <= entities
    con.close()

fresh_case(); legacy_case(); entity_case(); print(json.dumps({'fresh': True, 'legacy': True, 'fts_entities': True}))
