ALTER TABLE predictions
ADD COLUMN top_features JSONB NOT NULL DEFAULT '{}'::jsonb;

SELECT*FROM predictions

SELECT user_id, email, created_at
FROM users
ORDER BY created_at DESC;