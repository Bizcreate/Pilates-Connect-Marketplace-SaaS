# Database Reset and Testing Instructions

## Step 1: Reset All Data

Navigate to the Scripts section and run these SQL scripts in order:

1. **scripts/00_reset_all_data.sql** - Deletes all user data
2. **scripts/01_verify_schema.sql** - Verifies database structure is correct
3. **scripts/02_check_current_data.sql** - Shows current data counts

After reset, all counts should be 0.

## Step 2: Test Connection

1. Go to `/test-connection` in your browser
2. Click "Run All Tests"
3. Verify all tests pass and show 0 counts

## Step 3: Create Test Accounts

### Create Studio Account:
1. Go to `/auth/sign-up/studio`
2. Use test email: `studio@test.com`
3. Complete onboarding with studio details
4. Note: Check email for confirmation link

### Create Instructor Account:
1. Go to `/auth/sign-up/instructor`  
2. Use test email: `instructor@test.com`
3. Complete onboarding with instructor details
4. Note: Check email for confirmation link

## Step 4: Post Test Data

### As Studio:
1. **Post a Job**: Go to `/studio/post-job`
   - Fill in all required fields
   - Set status as "open"
   - Click "Post Job"
   
2. **Request Cover**: Go to `/studio/request-cover`
   - Fill in date, time, class type
   - Click "Request Cover"

### As Instructor:
1. **Post Availability**: Go to `/instructor/post-availability`
   - Add date ranges and times
   - Select equipment and level
   - Click "Post Availability"

2. **Complete Profile**: Go to `/instructor/profile`
   - Fill in all fields (experience, certifications, rates)
   - This is crucial for appearing in searches

## Step 5: Verify Data Displays

### Check These Pages Show Data:

1. **Jobs Page** (`/jobs`):
   - Should show 1+ jobs
   - Counts should match
   
2. **Find Instructors** (`/find-instructors`):
   - Should show 1 instructor
   - Full profile details visible if logged in as studio
   
3. **Studio Dashboard** (`/studio/dashboard`):
   - Should show 1+ active jobs
   - Should show 1+ cover requests
   - Should show 1 available instructor

4. **Instructor Dashboard** (`/instructor/dashboard`):
   - Should show posted availability
   - Should show available jobs

## Step 6: Run Diagnostic Scripts

If data still doesn't show:

1. Run `scripts/02_check_current_data.sql` to see actual data
2. Run `scripts/03_fix_null_statuses.sql` to fix NULL status values
3. Go back to `/test-connection` and run tests again

## Common Issues:

### "Profiles have NULL status"
- Run `scripts/03_fix_null_statuses.sql`

### "Jobs not showing"
- Check that studio_id matches your profile ID
- Check that status = 'open'
- Run test connection to verify data

### "Instructor details not showing"
- Complete instructor profile with all fields
- Verify instructor_profiles table has a record

### "Need to clear cache to see buttons"
- This is a Next.js hydration issue
- Should be fixed with the client-page.tsx updates
- Try hard refresh (Cmd/Ctrl + Shift + R)
