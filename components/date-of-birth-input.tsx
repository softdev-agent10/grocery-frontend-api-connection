"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateOfBirthInput({ className, onChange }: { className?: string; onChange?: (date: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && onChange) {
      onChange(newDate.toISOString().split('T')[0])
    }
    setOpen(false)
  }

  return (
    <Field className={className || "mx-auto w-44"}>
      {/* <FieldLabel htmlFor="date">Date of Birth</FieldLabel> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-start font-normal md:h-12"
          >
            {date ? date.toLocaleDateString() : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            onSelect={handleDateChange}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
