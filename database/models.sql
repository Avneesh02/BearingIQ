-- ==========================================================
-- BearingIQ Database
-- Models Table
-- ==========================================================

CREATE TABLE IF NOT EXISTS models (

    -- ======================================================
    -- Primary Key
    -- ======================================================

    model_id SERIAL PRIMARY KEY,

    -- ======================================================
    -- Model Information
    -- ======================================================

    model_name VARCHAR(100) NOT NULL,

    algorithm VARCHAR(100) NOT NULL,

    version VARCHAR(20) NOT NULL,

    description TEXT,

    -- ======================================================
    -- Performance Metrics
    -- ======================================================

    accuracy DECIMAL(5,2)
        NOT NULL
        CHECK (accuracy BETWEEN 0 AND 100),

    precision_score DECIMAL(5,2)
        NOT NULL
        CHECK (precision_score BETWEEN 0 AND 100),

    recall_score DECIMAL(5,2)
        NOT NULL
        CHECK (recall_score BETWEEN 0 AND 100),

    f1_score DECIMAL(5,2)
        NOT NULL
        CHECK (f1_score BETWEEN 0 AND 100),

    cross_validation_accuracy DECIMAL(5,2)
        CHECK (cross_validation_accuracy BETWEEN 0 AND 100),

    -- ======================================================
    -- Hyperparameter Information
    -- ======================================================

    hyperparameters JSONB,

    -- ======================================================
    -- Model Status
    -- ======================================================

    is_active BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ======================================================
    -- Model File Information
    -- ======================================================

    model_path VARCHAR(255) NOT NULL,

    -- ======================================================
    -- Training Information
    -- ======================================================

    trained_on TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- ======================================================
    -- Constraints
    -- ======================================================

    CONSTRAINT unique_model_version
        UNIQUE (model_name, version)

);

-- ==========================================================
-- Allow Only One Active Model
-- ==========================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_model

ON models (is_active)

WHERE is_active = TRUE;

-- ==========================================================
-- View Table Structure
-- ==========================================================

SELECT

    column_name,

    data_type,

    is_nullable

FROM information_schema.columns

WHERE table_name = 'models';

-- ==========================================================
-- View All Models
-- ==========================================================

SELECT *

FROM models;

-- ==========================================================
-- Count Total Models
-- ==========================================================

SELECT

COUNT(*) AS total_models

FROM models;

-- ==========================================================
-- Active Model
-- ==========================================================

SELECT *

FROM models

WHERE is_active = TRUE;

-- ==========================================================
-- Best Accuracy Model
-- ==========================================================

SELECT *

FROM models

ORDER BY accuracy DESC

LIMIT 1;

-- ==========================================================
-- Latest Trained Model
-- ==========================================================

SELECT *

FROM models

ORDER BY trained_on DESC

LIMIT 1;

-- ==========================================================
-- Search Model
-- ==========================================================

SELECT *

FROM models

WHERE model_name = 'Random Forest';

-- ==========================================================
-- Activate Model
-- ==========================================================

-- UPDATE models
-- SET is_active = TRUE
-- WHERE model_id = 1;

-- ==========================================================
-- Deactivate Model
-- ==========================================================

-- UPDATE models
-- SET is_active = FALSE
-- WHERE model_id = 1;

-- ==========================================================
-- Update Model Path
-- ==========================================================

-- UPDATE models
-- SET model_path = 'models/final/final_random_forest.pkl'
-- WHERE model_id = 1;

-- ==========================================================
-- Delete Model
-- ==========================================================

-- DELETE FROM models
-- WHERE model_id = 1;

-- ==========================================================
-- Drop Table
-- ==========================================================

-- DROP TABLE models;