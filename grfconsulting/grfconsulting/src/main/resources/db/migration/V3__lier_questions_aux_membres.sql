ALTER TABLE legal_questions
    ADD CONSTRAINT fk_legal_questions_utilisateur FOREIGN KEY (user_id) REFERENCES utilisateurs(id);

CREATE INDEX idx_legal_questions_user_created ON legal_questions (user_id, created_at DESC);
