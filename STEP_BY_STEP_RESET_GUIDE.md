# Complete Database Reset & Testing Guide

## Overview
This guide will help you systematically reset your database, verify the schema, and test that everything works correctly.

---

## Phase 1: Database Reset (Supabase SQL Editor)

### Step 1: Run Complete Reset
1. Go to your Supabase dashboard: https://jeahpbmwgzeokihpdywk.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Open and run: `scripts/01_complete_reset.sql`
4. **Expected Result**: All tables should show 0 records
5. **Verify**: You should see output like:
   \`\`\`
   Profiles: 0 remaining_records
   Studio Profiles: 0 remaining_records
   Instructor Profiles: 0 remaining_records
   Jobs: 0 remaining_records
   Cover Requests: 0 remaining_records
   \`\`\`

### Step 2: Verify Schema
1. In SQL Editor, run: `scripts/02_verify_and_fix_schema.sql`
2. **Expected Result**: All 13 tables should exist
3. **Check for**:
   - All tables have status "✓ Exists"
   - Foreign key constraints are listed
   - RLS policies exist for all tables

### Step 3: Fix Profile Triggers
1. In SQL Editor, run: `scripts/03_fix_profile_triggers.sql`
2. **Expected Result**: Trigger `on_auth_user_created` should be created
3. **Purpose**: This ensures profiles are auto-created when users sign up

### Step 4: Verify RLS Policies
1. In SQL Editor, run: `scripts/04_verify_rls_policies.sql`
2. **Expected Result**: Should show RLS enabled and policies for all tables
3. **Check**: Policies should allow SELECT for authenticated users

---

## Phase 2: Clean Up Existing Users (Supabase Auth)

### Step 5: Delete All Test Accounts
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Delete ALL existing test accounts
3. **Why**: This ensures clean slate with proper triggers

---

## Phase 3: Create Fresh Test Accounts

### Step 6: Create Studio Account
1. On your app: https://pilatesconnect.vercel.app
2. Click **Get Started** or **Sign Up**
3. Select **Studio** account type
4. Fill in details:
   - Email: `teststudio@example.com`
   - Password: `TestPassword123!`
5. **Important**: Complete email verification if required

### Step 7: Create Instructor Account
1. Sign out of studio account
2. Click **Sign Up**
3. Select **Instructor** account type
4. Fill in details:
   - Email: `testinstructor@example.com`
   - Password: `TestPassword123!`
5. **Important**: Complete email verification if required

---

## Phase 4: Verify Profiles Were Created

### Step 8: Check Profiles in Database
1. In Supabase SQL Editor, run: `scripts/05_test_manual_inserts.sql`
2. **Expected Result**: 
   - Should show 2 auth users
   - Should show 2 profiles (one studio, one instructor)
   - Should show 1 studio_profile
   - Should show 1 instructor_profile
3. **If profiles are missing**: The trigger didn't fire - you'll need to create them manually

---

## Phase 5: Test Data Entry

### Step 9: Login as Studio and Complete Profile
1. Login to your app as studio: `teststudio@example.com`
2. Go to **Dashboard** → **Profile**
3. Fill in ALL profile fields:
   - Studio Name
   - Display Name
   - Location
   - Bio
   - Phone
4. Click **Save Profile**
5. **Verify**: You should see "Profile updated successfully"

### Step 10: Login as Studio and Post a Job
1. Still logged in as studio
2. Go to **Dashboard** → **Post New Job**
3. Fill in job details:
   - Title: "Test Job 1"
   - Description: "This is a test job"
   - Location: "Sydney, NSW"
   - Job Type: "Full-time"
   - Pay Rate: "$50-70/hour"
   - Status: "open"
4. Click **Post Job**
5. **Verify**: You should see success message

### Step 11: Post a Cover Request
1. Still logged in as studio
2. Go to **Dashboard** → **Request Cover**
3. Fill in cover details:
   - Date: Tomorrow's date
   - Time: 9:00 AM - 10:00 AM
   - Class Type: "Mat - Intermediate"
   - Notes: "Need last-minute cover"
4. Click **Request Cover**
5. **Verify**: You should see success message

### Step 12: Login as Instructor and Complete Profile
1. Logout from studio account
2. Login as instructor: `testinstructor@example.com`
3. Go to **Dashboard** → **Profile**
4. Fill in ALL profile fields:
   - Display Name
   - Bio
   - Location
   - Years of Experience
   - Certifications (select at least one)
   - Hourly Rate Range
5. Click **Save Profile**
6. **Verify**: You should see "Profile updated successfully"

### Step 13: Add Availability
1. Still logged in as instructor
2. Go to **Dashboard** → **Availability**
3. Click **Add Availability**
4. Select:
   - Type: "Available for Cover"
   - Date Range: Next week
   - Time slots
5. Click **Save**
6. **Verify**: Availability should appear in list

---

## Phase 6: Run Connection Tests

### Step 14: Run Test Connection (Logged Out)
1. Logout from all accounts
2. Navigate to: https://pilatesconnect.vercel.app/test-connection
3. Click **Run All Tests**
4. **Expected Result**: 
   - Authentication: ✗ Not authenticated (this is correct)
   - Most queries should return warnings (no data because not logged in)

### Step 15: Run Test Connection (Logged In as Studio)
1. Login as studio account
2. Navigate to: /test-connection
3. Click **Run All Tests**
4. **Expected Result**:
   - ✓ Authentication: authenticated = true
   - ✓ Profiles: count = 2
   - ✓ Current User Profile: exists = true
   - ✓ Jobs: count = 1 (the job you posted)
   - ✓ Cover Requests: count = 1
   - ✓ Instructors: count = 1
   - ✓ Studio Profiles: count = 1
   - ✓ Instructor Profiles: count = 1

### Step 16: Run Test Connection (Logged In as Instructor)
1. Logout and login as instructor
2. Navigate to: /test-connection
3. Click **Run All Tests**
4. **Expected Result**: Same as above - all data should be visible

---

## Phase 7: Test Pages Display Data

### Step 17: Test Jobs Page
1. Navigate to: /jobs
2. **Expected Result**: Should show the 1 job you posted
3. **Check**: Job title, description, location all display correctly

### Step 18: Test Find Instructors Page
1. Navigate to: /find-instructors
2. **Expected Result**: Should show the 1 instructor profile
3. **Check**: Instructor name, bio, certifications display

### Step 19: Test Studio Dashboard
1. Login as studio
2. Go to: /studio/dashboard
3. **Expected Result**:
   - Active Jobs: 1
   - Cover Requests: 1
   - Available Instructors: 1
   - Job and cover request cards display with details

---

## Troubleshooting

### If jobs are not displaying:
1. Check browser console for errors
2. Run test-connection to verify jobs exist in database
3. Check RLS policies allow studios to read their own jobs
4. Verify `studio_id` matches your user ID

### If profiles are not saving:
1. Check browser console for errors
2. Verify profile exists in database (test-connection)
3. Check if update query is using correct user ID
4. Look for RLS policy blocking updates

### If instructor details are not showing:
1. Verify instructor_profiles record exists
2. Check if all fields are NULL
3. Ensure profile form is actually calling the save function
4. Check for foreign key errors

---

## Success Criteria

You'll know everything is working when:
- ✅ Test connection shows all green checkmarks
- ✅ Jobs page displays your test job
- ✅ Find Instructors page shows instructor profile with details
- ✅ Studio dashboard shows correct counts and data
- ✅ Instructor dashboard shows available jobs and covers
- ✅ Profile pages load and save successfully

---

## Next Steps After Success

Once everything is working:
1. Delete test accounts
2. Create your real accounts
3. Start using the platform normally
4. Monitor for any data not saving
5. Check browser console regularly for errors
