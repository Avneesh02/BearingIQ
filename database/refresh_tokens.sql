-- ==========================================================
-- BearingIQ Database
-- Refresh Tokens Table
-- ==========================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (

    -- ======================================================
    -- Primary Key
    -- ======================================================

    token_id SERIAL PRIMARY KEY,

    -- ======================================================
    -- User Reference
    -- ======================================================

    user_id INTEGER NOT NULL,

    -- ======================================================
    -- Refresh Token Hash
    -- ======================================================

    token_hash VARCHAR(255)
        NOT NULL
        UNIQUE,

    -- ======================================================
    -- JWT ID
    -- ======================================================

    jti VARCHAR(100)
        NOT NULL
        UNIQUE,

    -- ======================================================
    -- Expiry
    -- ======================================================

    expires_at TIMESTAMP
        NOT NULL,

    -- ======================================================
    -- Token Status
    -- ======================================================

    is_revoked BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    revoked_at TIMESTAMP,

    -- ======================================================
    -- Device Information
    -- ======================================================

    device_name VARCHAR(100),

    ip_address VARCHAR(45),

    user_agent VARCHAR(500),

    -- ======================================================
    -- Created Timestamp
    -- ======================================================

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- ======================================================
    -- Foreign Key
    -- ======================================================

    CONSTRAINT fk_refresh_token_user

        FOREIGN KEY (user_id)

        REFERENCES users(user_id)

        ON DELETE CASCADE,

    -- ======================================================
    -- Check Constraints
    -- ======================================================

    CONSTRAINT chk_refresh_token_expiry

        CHECK (
            expires_at > created_at
        ),

    CONSTRAINT chk_revoked_consistency

        CHECK (

            (is_revoked = FALSE AND revoked_at IS NULL)

            OR

            (is_revoked = TRUE AND revoked_at IS NOT NULL)

        )

);

-- ==========================================================
-- Indexes
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_refresh_user
ON refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_jti
ON refresh_tokens(jti);

CREATE INDEX IF NOT EXISTS idx_refresh_expiry
ON refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_revoked
ON refresh_tokens(is_revoked);

-- ==========================================================
-- View Structure
-- ==========================================================

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'refresh_tokens';

-- ==========================================================
-- View All Tokens
-- ==========================================================

SELECT *
FROM refresh_tokens;

-- ==========================================================
-- Active Tokens
-- ==========================================================

SELECT *
FROM refresh_tokens
WHERE
    is_revoked = FALSE
    AND expires_at > CURRENT_TIMESTAMP;

-- ==========================================================
-- Revoked Tokens
-- ==========================================================

SELECT *
FROM refresh_tokens
WHERE is_revoked = TRUE;

-- ==========================================================
-- Expired Tokens
-- ==========================================================

SELECT *
FROM refresh_tokens
WHERE expires_at <= CURRENT_TIMESTAMP;

-- ==========================================================
-- Delete Expired Tokens
-- ==========================================================

-- DELETE
-- FROM refresh_tokens
-- WHERE expires_at <= CURRENT_TIMESTAMP;

-- ==========================================================
-- Drop Table
-- ==========================================================

-- DROP TABLE refresh_tokens;
-- DROP TABLE refresh_tokens;