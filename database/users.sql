-- ==========================================================
-- BearingIQ
-- Users Table
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (

    -- ------------------------------------------------------
    -- Primary Key
    -- ------------------------------------------------------

    user_id SERIAL PRIMARY KEY,

    -- ------------------------------------------------------
    -- User Information
    -- ------------------------------------------------------

    full_name VARCHAR(100) NOT NULL,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    -- ------------------------------------------------------
    -- User Role
    -- ------------------------------------------------------

    role VARCHAR(20)
        NOT NULL
        DEFAULT 'user'
        CHECK (role IN ('admin', 'user')),

    -- ------------------------------------------------------
    -- Account Status
    -- ------------------------------------------------------

    is_active BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    is_verified BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ------------------------------------------------------
    -- Login Information
    -- ------------------------------------------------------

    last_login TIMESTAMP,

    -- ------------------------------------------------------
    -- Timestamps
    -- ------------------------------------------------------

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP

);

-- ==========================================================
-- View Table Structure
-- ==========================================================

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- ==========================================================
-- View All Users
-- ==========================================================

SELECT *
FROM users;

-- ==========================================================
-- Total Users
-- ==========================================================

SELECT
COUNT(*) AS total_users
FROM users;

-- ==========================================================
-- Active Users
-- ==========================================================

SELECT *
FROM users
WHERE is_active = TRUE;

-- ==========================================================
-- Verified Users
-- ==========================================================

SELECT *
FROM users
WHERE is_verified = TRUE;

-- ==========================================================
-- Admin Users
-- ==========================================================

SELECT *
FROM users
WHERE role = 'admin';

-- ==========================================================
-- Search By Username
-- ==========================================================

SELECT *
FROM users
WHERE username = 'avneesh';

-- ==========================================================
-- Search By Email
-- ==========================================================

SELECT *
FROM users
WHERE email = 'avneesh@gmail.com';

-- ==========================================================
-- Update User Role
-- ==========================================================

-- UPDATE users
-- SET role='admin'
-- WHERE user_id=1;

-- ==========================================================
-- Verify User
-- ==========================================================

-- UPDATE users
-- SET is_verified=TRUE
-- WHERE user_id=1;

-- ==========================================================
-- Deactivate User
-- ==========================================================

-- UPDATE users
-- SET is_active=FALSE
-- WHERE user_id=1;

-- ==========================================================
-- Update Last Login
-- ==========================================================

-- UPDATE users
-- SET last_login=CURRENT_TIMESTAMP
-- WHERE user_id=1;

-- ==========================================================
-- Delete User
-- ==========================================================

-- DELETE FROM users
-- WHERE user_id=1;

-- ==========================================================
-- Drop Table
-- ==========================================================

-- DROP TABLE users;


SELECT * FROM users;