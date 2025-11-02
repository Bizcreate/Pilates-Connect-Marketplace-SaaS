"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, DollarSign, AlertCircle } from "lucide-react"

interface CoverRequestDialogProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept?: () => Promise<void>
}

export function CoverRequestDialog({ request, open, onOpenChange, onAccept }: CoverRequestDialogProps) {
  const [accepting, setAccepting] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await onAccept?.()
    } catch (error) {
      console.error("[v0] Error accepting cover:", error)
    } finally {
      setAccepting(false)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {request.class_type || "Pilates Class"}
            <Badge variant="destructive" className="text-xs">
              Urgent
            </Badge>
          </DialogTitle>
          <DialogDescription>{request.studio?.display_name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>
                {new Date(request.date).toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>
                {request.start_time} - {request.end_time}
              </span>
            </div>
            {request.studio?.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{request.studio.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Rate:</span>
              <span>$85/hour (estimated)</span>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div>
              <h4 className="font-semibold mb-2">Additional Details</h4>
              <p className="text-sm text-muted-foreground">{request.notes}</p>
            </div>
          )}

          {/* Requirements */}
          <div>
            <h4 className="font-semibold mb-2">Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Valid Pilates certification required</li>
              <li>• Experience with {request.class_type || "Reformer"} classes</li>
              <li>• Arrive 15 minutes early for setup</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-orange-900 dark:text-orange-100">Urgent Cover Request</p>
              <p className="text-orange-700 dark:text-orange-300">
                This class is scheduled soon. Please only accept if you can definitely make it.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={accepting}>
              {accepting ? "Accepting..." : "Accept Cover Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
