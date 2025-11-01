-- Verification script to check all tables are properly set up

-- Check jobs table
SELECT 'jobs table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- Check availability_slots table
SELECT 'availability_slots table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'availability_slots' 
ORDER BY ordinal_position;

-- Check casual_postings table
SELECT 'casual_postings table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'casual_postings' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 'RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('jobs', 'availability_slots', 'casual_postings')
ORDER BY tablename, policyname;
