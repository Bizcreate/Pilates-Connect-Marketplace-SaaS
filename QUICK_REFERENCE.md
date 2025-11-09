# Quick Reference: Common Issues & Fixes

## Issue: Jobs Not Displaying

**Symptoms**: Jobs page shows 0 jobs, but test-connection shows jobs exist

**Fix**:
1. Check if logged in as correct user
2. Verify jobs query in browser console
3. Look for RLS policy errors
4. Check `studio_id` foreign key matches your user ID

**Quick Test**:
\`\`\`sql
-- Run in Supabase SQL Editor
SELECT id, title, studio_id, status FROM jobs;
\`\`\`

---

## Issue: Profile Not Saving

**Symptoms**: Click "Save Profile" but data doesn't persist

**Fix**:
1. Open browser console (F12)
2. Look for red error messages
3. Check if profile record exists: run test-connection
4. Verify RLS policy allows updates

**Quick Test**:
\`\`\`sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
SELECT * FROM studio_profiles WHERE id = 'YOUR_USER_ID';
\`\`\`

---

## Issue: Not Authenticated

**Symptoms**: test-connection shows authenticated = false

**Fix**:
1. You're not logged in - go to /auth/login
2. If you are logged in, session may be expired
3. Clear cookies and login again
4. Check middleware is running

---

## Issue: NULL Profile Fields

**Symptoms**: Profile exists but all fields are NULL

**Fix**:
1. Profile form isn't saving data
2. Check browser console for errors during save
3. Verify upsert query is being called
4. Run the save manually in Supabase SQL Editor

**Manual Fix**:
\`\`\`sql
-- Update studio profile manually
UPDATE studio_profiles 
SET studio_name = 'Test Studio', 
    website = 'https://test.com'
WHERE id = 'YOUR_USER_ID';

-- Update main profile
UPDATE profiles 
SET display_name = 'Test Studio'
WHERE id = 'YOUR_USER_ID';
\`\`\`

---

## Issue: Trigger Not Creating Profiles

**Symptoms**: New user created but no profile record

**Fix**:
1. Run: `scripts/03_fix_profile_triggers.sql`
2. Verify trigger exists in Supabase dashboard
3. Delete user and re-register
4. If still fails, create profile manually

**Manual Profile Creation**:
\`\`\`sql
-- Create profile for existing user
INSERT INTO profiles (id, email, user_type, created_at, updated_at)
SELECT id, email, 'studio', NOW(), NOW()
FROM auth.users
WHERE email = 'YOUR_EMAIL';

-- Create studio profile
INSERT INTO studio_profiles (id, created_at, updated_at)
SELECT id, NOW(), NOW()
FROM auth.users
WHERE email = 'YOUR_STUDIO_EMAIL';
\`\`\`

---

## Quick Commands

### Clear All Data:
Run in Supabase SQL Editor: `scripts/01_complete_reset.sql`

### Check What Data Exists:
Navigate to: https://pilatesconnect.vercel.app/test-connection

### View Logs:
Open browser console (F12) and look for `[v0]` prefixed messages

### Check Current User:
\`\`\`javascript
// Run in browser console
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log(data.session?.user)
