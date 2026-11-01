CREATE TABLE legal_questions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    domain VARCHAR(40) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_references TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_legal_questions_created_at ON legal_questions (created_at DESC);
