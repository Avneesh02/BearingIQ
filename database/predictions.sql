-- ==========================================================
-- BearingIQ Database
-- Predictions Table
-- ==========================================================

DROP TABLE IF EXISTS predictions CASCADE;

CREATE TABLE predictions (

    -- ======================================================
    -- Primary Key
    -- ======================================================

    prediction_id SERIAL PRIMARY KEY,

    -- ======================================================
    -- Foreign Keys
    -- ======================================================

    user_id INTEGER NOT NULL,

    model_id INTEGER NOT NULL,

    -- ======================================================
    -- Prediction Result
    -- ======================================================

    predicted_label VARCHAR(50) NOT NULL,

    prediction_confidence NUMERIC(5,2) NOT NULL,

    -- ======================================================
    -- Probability Distribution
    -- ======================================================

    class_probabilities JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    -- ======================================================
    -- Input Features
    -- ======================================================

    input_features JSONB
        NOT NULL,

    -- ======================================================
    -- SHAP Values
    -- ======================================================

    shap_values JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    -- ======================================================
    -- Time
    -- ======================================================

    prediction_time TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- ======================================================
    -- Foreign Keys
    -- ======================================================

    CONSTRAINT fk_prediction_user

        FOREIGN KEY (user_id)

        REFERENCES users(user_id)

        ON DELETE CASCADE,

    CONSTRAINT fk_prediction_model

        FOREIGN KEY (model_id)

        REFERENCES models(model_id)

        ON DELETE RESTRICT,

    -- ======================================================
    -- Constraints
    -- ======================================================

    CONSTRAINT chk_prediction_confidence

        CHECK (
            prediction_confidence BETWEEN 0 AND 100
        )

);

-- ==========================================================
-- Indexes
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_prediction_user
ON predictions(user_id);

CREATE INDEX IF NOT EXISTS idx_prediction_model
ON predictions(model_id);

CREATE INDEX IF NOT EXISTS idx_prediction_time
ON predictions(prediction_time);

-- ==========================================================
-- Verify Table Structure
-- ==========================================================

SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'predictions';

-- ==========================================================
-- View Predictions
-- ==========================================================

SELECT *
FROM predictions;