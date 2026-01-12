-- Reset password for Kerem user
-- This will set the password to 'admin123'

USE elitehome;

-- Update Kerem's password to 'admin123' (hashed)
UPDATE users 
SET password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE username = 'Kerem';

-- Verify the update
SELECT id, username, role, is_blocked FROM users WHERE username = 'Kerem';
