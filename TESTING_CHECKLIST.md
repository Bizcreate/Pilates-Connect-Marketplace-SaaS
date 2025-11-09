# Pilates Connect - Testing Checklist

## Step 1: Reset Database ✅
- [x] Run `PILATES_01_reset.sql` in Supabase SQL Editor
- [ ] Verify all tables show 0 records

---

## Step 2: Create Studio Account
- [ ] Sign out of any current session
- [ ] Go to Sign Up → Studio
- [ ] Use a NEW email (e.g., `teststudio@example.com`)
- [ ] Complete signup
- [ ] Fill out studio profile:
  - Studio name
  - Location (suburb, state, postcode)
  - Phone number
  - Bio
- [ ] Click Save
- [ ] **CHECK**: Does the success message appear?

---

## Step 3: Post a Test Job
- [ ] Go to Dashboard → "Post New Job"
- [ ] Fill out job details:
  - Job title
  - Job type (full-time/part-time/casual/contract)
  - Description
  - Location
  - Salary range
  - Required equipment
- [ ] Click "Post Job"
- [ ] **CHECK**: Does success message appear?
- [ ] **CHECK**: Does job appear in "Active Jobs (0)" → should now show (1)?

---

## Step 4: Create Cover Request
- [ ] Go to "Request Cover"
- [ ] Fill out details:
  - Date
  - Time
  - Class type
  - Notes
- [ ] Submit
- [ ] **CHECK**: Does it appear in "Cover Requests"?

---

## Step 5: Test Connection Page (While Logged In as Studio)
- [ ] Navigate to `/test-connection`
- [ ] **CHECK Authentication**: Should show `"authenticated": true`
- [ ] **CHECK Profiles Table**: Should show 1 profile with your studio email and user_type: "studio"
- [ ] **CHECK Studio Profiles**: Should show 1 record with your studio_name and details
- [ ] **CHECK Jobs Table**: Should show 1 job with all the details you entered
- [ ] **CHECK Cover Requests**: Should show 1 cover request

---

## Step 6: Create Instructor Account
- [ ] Sign out
- [ ] Go to Sign Up → Instructor
- [ ] Use a NEW email (e.g., `testinstructor@example.com`)
- [ ] Complete signup
- [ ] Fill out instructor profile:
  - Display name
  - Location
  - Bio
  - Phone number
  - Years of experience
  - Certifications
  - Hourly rate range
- [ ] Click Save
- [ ] **CHECK**: Does the success message appear?

---

## Step 7: Set Availability
- [ ] Go to Availability
- [ ] Add an availability slot:
  - Date/time
  - Availability type (cover/permanent)
  - Notes
- [ ] Save
- [ ] **CHECK**: Does it appear in your availability list?

---

## Step 8: Test Connection Page (While Logged In as Instructor)
- [ ] Navigate to `/test-connection`
- [ ] **CHECK Authentication**: Should show `"authenticated": true`
- [ ] **CHECK Profiles Table**: Should show 2 profiles (studio + instructor)
- [ ] **CHECK Instructor Profiles**: Should show 1 record with your display_name and details
- [ ] **CHECK Availability Slots**: Should show 1 availability slot

---

## Step 9: Browse Jobs as Instructor
- [ ] Go to "Jobs" page
- [ ] **CHECK**: Do you see the job posted by the studio?
- [ ] **CHECK**: Can you click on it and see full details?

---

## Step 10: Browse Instructors as Studio
- [ ] Sign out
- [ ] Sign back in as Studio account
- [ ] Go to "Find Instructors"
- [ ] **CHECK**: Do you see the instructor you created?
- [ ] **CHECK**: Can you see their profile details?

---

## Common Issues & Fixes

### If data doesn't save:
1. Check browser console for errors (F12 → Console)
2. Look for any red error messages
3. Check if you're actually logged in (Authentication test should be true)

### If queries return empty:
1. Verify RLS policies allow reading the data
2. Check foreign keys are correct (studio_id, instructor_id)
3. Verify user_type matches ("studio" vs "instructor")

### If profile updates don't work:
1. Check that the profile record exists first
2. Verify you're updating the correct table (studio_profiles vs instructor_profiles)
3. Look for console.log("[v0] ...") debug messages

---

## Success Criteria
✅ All data saves successfully  
✅ Test connection shows all records  
✅ Studios can see jobs and instructors  
✅ Instructors can see jobs and their own data  
✅ No errors in browser console
