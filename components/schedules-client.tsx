'use client'

import { useState } from 'react'
import { RecurringSchedule } from '@/lib/types'
import ScheduleCreationForm from '@/components/schedule-creation-form'
import ScheduleListView from '@/components/schedule-list-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SchedulesClientProps {
  studioId: string
  initialSchedules: RecurringSchedule[]
}

export default function SchedulesClient({ studioId, initialSchedules }: SchedulesClientProps) {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>(initialSchedules)
  const [isCreating, setIsCreating] = useState(false)

  const handleScheduleCreated = (newSchedule: RecurringSchedule) => {
    setSchedules([...schedules, newSchedule])
    setIsCreating(false)
  }

  const handleScheduleDeleted = (scheduleId: string) => {
    setSchedules(schedules.filter((s) => s.id !== scheduleId))
  }

  const handleScheduleUpdated = (updatedSchedule: RecurringSchedule) => {
    setSchedules(schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Schedule List ({schedules.length})</TabsTrigger>
          <TabsTrigger value="create">Create Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {schedules.length > 0 ? (
            <ScheduleListView
              schedules={schedules}
              onScheduleDeleted={handleScheduleDeleted}
              onScheduleUpdated={handleScheduleUpdated}
              studioId={studioId}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Schedules Yet</CardTitle>
                <CardDescription>Create your first recurring schedule to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Recurring schedules help you manage weekly class times, assign instructors, and keep everything organized.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Schedule</CardTitle>
              <CardDescription>Set up a recurring class schedule for your studio</CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleCreationForm studioId={studioId} onScheduleCreated={handleScheduleCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
