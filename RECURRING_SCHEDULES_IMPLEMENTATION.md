# PilatesConnect - Recurring Schedule Management System

## Overview
Complete recurring schedule management system built for studios to create, manage, and assign instructors to recurring weekly classes.

## Database Schema (scripts/017_create_recurring_schedules.sql)
- **recurring_schedules**: Core table for weekly class schedules with day, time, equipment, instructor assignments, notes, and capacity
- **schedule_assignments**: Track instructor assignments to specific dates with confirmation status
- Includes RLS policies, auto-update timestamps, and performance indexes

## Frontend Components

### Core Components
- **components/schedule-creation-form.tsx**: Form to create new recurring schedules with day selection, time picker, equipment types, instructor assignment, and capacity settings
- **components/schedule-list-view.tsx**: Displays all schedules in a sortable list with edit/delete capabilities, showing day, time, instructor, and equipment info
- **components/schedule-assignment.tsx**: Modal/dialog for assigning instructors to specific schedule dates with confirmation and notes

### Page Components
- **app/studio/recurring-schedules/page.tsx**: Main schedule management page with tabs for viewing and creating schedules, handles authentication and data loading
- **components/schedules-client.tsx**: Client wrapper component for schedule management with state management

### Dashboard Integration
- Updated **app/studio/dashboard/page.tsx** with:
  - New "Schedules" tab in the dashboard tabs list
  - Quick link to "Manage Schedules" in the overview section
  - Card displaying schedule information with navigation to full schedule management

## Server Actions (app/actions/recurring-schedules.ts)
- `createRecurringSchedule()`: Create new recurring schedule
- `updateRecurringSchedule()`: Update existing schedule
- `deleteRecurringSchedule()`: Delete a schedule
- `getStudioSchedules()`: Fetch all schedules for a studio
- `assignInstructor()`: Assign instructor to a specific date
- `getScheduleAssignments()`: Fetch assignments for a schedule

## Features
✅ Create weekly recurring classes with day/time selection
✅ Assign instructors to recurring schedules
✅ Track equipment types per class
✅ Add staff notes and capacity limits
✅ Set hourly rates for classes
✅ Sydney timezone support (IANA format stored)
✅ Schedule assignments with confirmation status
✅ Full CRUD operations with RLS security
✅ Automatic timestamps with audit trail
✅ Performance indexes on key fields

## Data Models (lib/types.ts)
```typescript
type ScheduleDay = "Monday" | "Tuesday" | ... | "Sunday"

interface RecurringSchedule {
  id: string
  studio_id: string
  class_name: string
  day_of_week: ScheduleDay
  start_time: string // HH:mm format
  end_time: string
  equipment_types: string[]
  instructor_id?: string
  instructor_notes?: string
  max_capacity?: number
  rate_per_hour?: number
  is_active: boolean
  timezone: string // e.g., "Australia/Sydney"
  created_at: string
  updated_at: string
}

interface ScheduleAssignment {
  id: string
  recurring_schedule_id: string
  assigned_instructor_id: string
  date_assigned: string
  notes?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
  updated_at: string
}
```

## Current Status
- ✅ All components built and integrated
- ✅ Mock data support for Supabase paused period
- ⏳ Ready for database activation with `scripts/017_create_recurring_schedules.sql`
- ✅ Full TypeScript support with proper types
- ✅ Responsive design with Tailwind CSS
- ✅ Studio dashboard integration complete

## Next Steps When Supabase is Active
1. Run `scripts/017_create_recurring_schedules.sql` in Supabase SQL editor
2. Update API calls in recurring-schedules page to use real database queries
3. Implement instructor availability fetching for assignment modal
4. Add email notifications for schedule changes
5. Create instructor-facing view of their assigned schedules
