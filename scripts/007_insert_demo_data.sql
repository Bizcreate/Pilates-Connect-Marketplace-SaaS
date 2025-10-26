-- Insert demo data for testing and development

-- Create a demo studio profile
do $$
declare
  demo_studio_id uuid;
begin
  -- Insert demo studio profile
  insert into public.profiles (
    id,
    user_type,
    email,
    display_name,
    bio,
    location,
    phone
  ) values (
    '00000000-0000-0000-0000-000000000001',
    'studio',
    'demo.studio@pilatesconnect.com.au',
    'Pilates Studio Melbourne',
    'Premier Pilates studio in Melbourne CBD offering a full range of equipment and classes.',
    'Melbourne, VIC',
    '(03) 9123 4567'
  ) on conflict (id) do nothing
  returning id into demo_studio_id;

  -- Insert studio-specific profile
  insert into public.studio_profiles (
    id,
    studio_name,
    equipment,
    verified,
    subscription_tier,
    instagram,
    website
  ) values (
    '00000000-0000-0000-0000-000000000001',
    'Pilates Studio Melbourne',
    array['Reformer', 'Cadillac', 'Chair', 'Barrel', 'Mat'],
    true,
    'premium',
    '@pilatesstudiomelb',
    'https://pilatesstudiomelb.com.au'
  ) on conflict (id) do nothing;
end $$;

-- Insert demo jobs
insert into public.jobs (
  studio_id,
  title,
  description,
  job_type,
  location,
  compensation_type,
  compensation_min,
  compensation_max,
  equipment,
  certifications_required,
  class_types,
  schedule_details,
  start_date,
  status
) values
(
  '00000000-0000-0000-0000-000000000001',
  'Senior Pilates Instructor - Full Time',
  'We are seeking an experienced Pilates instructor to join our premium studio in Melbourne CBD. You will be teaching a variety of classes including Reformer, Mat, and equipment-based sessions. The ideal candidate has strong technical skills, excellent communication, and a passion for helping clients achieve their fitness goals.',
  'full-time',
  'Melbourne CBD, VIC',
  'salary',
  65000,
  85000,
  array['Reformer', 'Cadillac', 'Chair', 'Mat'],
  array['Certificate IV in Pilates', 'First Aid'],
  array['Reformer', 'Mat', 'Tower'],
  'Monday to Friday, 6am-2pm or 2pm-8pm rotating shifts. Weekend availability required once per month.',
  current_date + interval '2 weeks',
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Part-Time Reformer Instructor',
  'Join our friendly team as a part-time Reformer instructor. Perfect for someone looking to build their teaching hours while maintaining flexibility. You will teach small group classes (max 8 clients) on our state-of-the-art Balanced Body reformers.',
  'part-time',
  'South Yarra, VIC',
  'hourly',
  45,
  65,
  array['Reformer'],
  array['Pilates Mat Certification', 'Reformer Certification'],
  array['Reformer'],
  '15-20 hours per week. Morning and evening classes available. Flexible scheduling.',
  current_date + interval '1 week',
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Casual Mat Pilates Instructor',
  'We are looking for a qualified Mat Pilates instructor to cover casual classes as needed. Great opportunity for instructors wanting to gain experience or supplement existing teaching hours. Classes range from beginner to advanced levels.',
  'casual',
  'Richmond, VIC',
  'per-class',
  80,
  120,
  array['Mat'],
  array['Mat Pilates Certification'],
  array['Mat'],
  'Casual basis - typically 3-8 classes per week. Morning, afternoon and evening slots available.',
  current_date,
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Equipment Specialist - Contract Position',
  'Exciting 6-month contract position for an experienced equipment specialist. You will be working with clients one-on-one and in small groups using our full range of Pilates apparatus. This role includes some training and mentoring of junior instructors.',
  'contract',
  'Brighton, VIC',
  'hourly',
  70,
  90,
  array['Reformer', 'Cadillac', 'Chair', 'Barrel', 'Tower'],
  array['Comprehensive Pilates Certification', 'Advanced Equipment Training'],
  array['Reformer', 'Cadillac', 'Chair', 'Barrel', 'Tower'],
  '6-month contract, 25-30 hours per week. Mix of private and group sessions.',
  current_date + interval '3 weeks',
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Prenatal & Postnatal Pilates Specialist',
  'We are expanding our prenatal and postnatal program and need a specialist instructor. You will design and deliver safe, effective classes for expecting and new mothers. Experience with modifications and understanding of pregnancy-related conditions essential.',
  'part-time',
  'Hawthorn, VIC',
  'hourly',
  55,
  75,
  array['Reformer', 'Mat', 'Chair'],
  array['Pilates Certification', 'Prenatal/Postnatal Specialization'],
  array['Reformer', 'Mat'],
  '12-18 hours per week. Daytime classes Monday to Friday.',
  current_date + interval '2 weeks',
  'active'
),
(
  '00000000-0000-0000-0000-000000000001',
  'Rehabilitation Pilates Instructor',
  'Join our clinical Pilates team working with clients recovering from injuries and managing chronic conditions. You will work closely with physiotherapists to deliver targeted rehabilitation programs. Strong anatomy knowledge and experience with special populations required.',
  'full-time',
  'Kew, VIC',
  'salary',
  70000,
  90000,
  array['Reformer', 'Cadillac', 'Chair', 'Barrel'],
  array['Clinical Pilates Certification', 'Anatomy & Physiology'],
  array['Reformer', 'Cadillac', 'Clinical'],
  'Monday to Friday, 8am-4pm. Occasional Saturday mornings. Collaborative environment with healthcare professionals.',
  current_date + interval '1 month',
  'active'
)
on conflict do nothing;
