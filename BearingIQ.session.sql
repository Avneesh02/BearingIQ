ALTER TABLE predictions
ADD COLUMN top_features JSONB NOT NULL DEFAULT '{}'::jsonb;

SELECT*FROM predictions