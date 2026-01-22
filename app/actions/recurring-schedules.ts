'use server'

import { createServerClient } from '@/lib/supabase/server'
import { RecurringSchedule, ScheduleAssignment } from '@/lib/types'
import { revalidateTag } from 'next/cache'

export async function createRecurringSchedule(schedule: Omit<RecurringSchedule, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerClient()
  
  try {
    const { data, error } = await supabase
      .from('recurring_schedules')
      .insert([schedule])
      .select()
      .single()
    
    if (error) throw error
    
    revalidateTag(`schedules-${schedule.studio_id}`)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to create schedule' }
  }
}

export async function updateRecurringSchedule(id: string, schedule: Partial<RecurringSchedule>) {
  const supabase = await createServerClient()
  
  try {
    const { data, error } = await supabase
      .from('recurring_schedules')
      .update(schedule)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    if (data) {
      revalidateTag(`schedules-${data.studio_id}`)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to update schedule' }
  }
}

export async function deleteRecurringSchedule(id: string, studioId: string) {
  const supabase = await createServerClient()
  
  try {
    const { error } = await supabase
      .from('recurring_schedules')
      .delete()
      .eq('id', id)
      .eq('studio_id', studioId)
    
    if (error) throw error
    
    revalidateTag(`schedules-${studioId}`)
    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete schedule' }
  }
}

export async function getStudioSchedules(studioId: string) {
  const supabase = await createServerClient()
  
  try {
    const { data, error } = await supabase
      .from('recurring_schedules')
      .select('*')
      .eq('studio_id', studioId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })
    
    if (error) throw error
    
    return { data: data as RecurringSchedule[], error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch schedules' }
  }
}

export async function assignInstructor(assignment: Omit<ScheduleAssignment, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerClient()
  
  try {
    const { data, error } = await supabase
      .from('schedule_assignments')
      .insert([assignment])
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to assign instructor' }
  }
}

export async function getScheduleAssignments(scheduleId: string) {
  const supabase = await createServerClient()
  
  try {
    const { data, error } = await supabase
      .from('schedule_assignments')
      .select('*')
      .eq('recurring_schedule_id', scheduleId)
      .order('date_assigned', { ascending: true })
    
    if (error) throw error
    
    return { data: data as ScheduleAssignment[], error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch assignments' }
  }
}
