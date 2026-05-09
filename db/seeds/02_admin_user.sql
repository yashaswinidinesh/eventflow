-- Replace hash before running manually
INSERT INTO users (id, email, password_hash, name, role)
VALUES (gen_random_uuid(), 'admin@eventure.app', '$2a$12$REPLACE_HASH', 'Eventure Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
