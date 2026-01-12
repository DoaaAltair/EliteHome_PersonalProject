-- Fix notifications table to add title column
-- Run this if your notifications table doesn't have a title column

USE elitehome;

-- Check if title column exists, if not add it
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255) AFTER id;

-- Update existing notifications to have null title (optional)
UPDATE notifications SET title = NULL WHERE title IS NULL;

-- Show the updated table structure
DESCRIBE notifications;
