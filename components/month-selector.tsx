"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthDisplay } from "@/lib/month-utils"
import { useTheme } from "@/lib/theme-context"

interface MonthSelectorProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const { language } = useTheme()

  const handlePrevious = () => {
    const [year, month] = currentMonth.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    date.setMonth(date.getMonth() - 1)
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    onMonthChange(newMonth)
  }

  const handleNext = () => {
    const [year, month] = currentMonth.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    date.setMonth(date.getMonth() + 1)
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    onMonthChange(newMonth)
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-card border rounded-lg p-3 shadow-sm">
      <Button variant="ghost" size="icon" onClick={handlePrevious}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="text-center">
        <p className="font-semibold text-lg capitalize">{getMonthDisplay(currentMonth, language)}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={handleNext}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
