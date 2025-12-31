"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Trash2, Check, TrendingUp, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MonthSelector } from "@/components/month-selector"
import { useTheme } from "@/lib/theme-context"
import { Progress } from "@/components/ui/progress"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  category: string
  deadline?: string
}

interface MetasTabProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

const DEFAULT_CATEGORIES = ["Emergência", "Viagem", "Aposentadoria", "Educação", "Casa", "Outros"]

export function MetasTab({ currentMonth, onMonthChange }: MetasTabProps) {
  const { t } = useTheme()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    category: DEFAULT_CATEGORIES[0],
    deadline: "",
  })
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  useEffect(() => {
    const monthKey = `month_${currentMonth}`
    const saved = localStorage.getItem(`${monthKey}_metas`)
    if (saved) {
      setGoals(JSON.parse(saved))
    }

    const savedCustomCategories = localStorage.getItem("custom_goal_categories")
    if (savedCustomCategories) {
      setCustomCategories(JSON.parse(savedCustomCategories))
    }
  }, [currentMonth])

  const saveGoals = (updatedGoals: Goal[]) => {
    const monthKey = `month_${currentMonth}`
    localStorage.setItem(`${monthKey}_metas`, JSON.stringify(updatedGoals))
    setGoals(updatedGoals)
  }

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: Number.parseFloat(newGoal.targetAmount),
      currentAmount: Number.parseFloat(newGoal.currentAmount) || 0,
      category: newGoal.category,
      deadline: newGoal.deadline || undefined,
    }

    saveGoals([...goals, goal])
    setNewGoal({ name: "", targetAmount: "", currentAmount: "0", category: DEFAULT_CATEGORIES[0], deadline: "" })
    setIsAddDialogOpen(false)
  }

  const removeGoal = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id))
  }

  const updateGoalAmount = (id: string, amount: string) => {
    const updatedGoals = goals.map((g) => (g.id === id ? { ...g, currentAmount: Number.parseFloat(amount) || 0 } : g))
    saveGoals(updatedGoals)
    setEditingGoal(null)
  }

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) return
    const updated = [...customCategories, newCategoryName.trim()]
    setCustomCategories(updated)
    localStorage.setItem("custom_goal_categories", JSON.stringify(updated))
    setNewCategoryName("")
  }

  const removeCustomCategory = (category: string) => {
    const updated = customCategories.filter((c) => c !== category)
    setCustomCategories(updated)
    localStorage.setItem("custom_goal_categories", JSON.stringify(updated))
  }

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("goals")}</h1>
          <p className="text-sm text-muted-foreground">{t("goalsSubtitle")}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsCategoriesDialogOpen(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthChange={onMonthChange} />

      <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            <h2 className="text-xl font-bold">{t("savingsProgress")}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-90">{t("saved")}</span>
              <span className="font-bold">
                R$ {totalSaved.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
                {totalTarget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Progress value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0} className="h-3 bg-white/20" />
            <p className="text-xs opacity-75 text-right">
              {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(1)}%` : "0%"} {t("completed")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => setIsAddDialogOpen(true)} className="w-full h-12 text-base" size="lg">
        <Plus className="h-5 w-5 mr-2" />
        {t("addGoal")}
      </Button>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{t("noGoals")}</h3>
                <p className="text-sm text-muted-foreground">{t("noGoalsDescription")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            const isCompleted = goal.currentAmount >= goal.targetAmount

            return (
              <Card key={goal.id} className={isCompleted ? "border-primary bg-primary/5" : ""}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        {isCompleted && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{goal.category}</p>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                          {t("deadline")}: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("progress")}</span>
                      <span className="font-semibold">
                        R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
                        {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {progress.toFixed(1)}% {t("completed")}
                      </p>
                      {!isCompleted && (
                        <p className="text-xs font-medium text-destructive">
                          {t("remaining")}: R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>

                  {editingGoal === goal.id ? (
                    <div className="flex gap-2 pt-2 border-t">
                      <Input
                        type="number"
                        placeholder={t("newAmount")}
                        defaultValue={goal.currentAmount}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateGoalAmount(goal.id, (e.target as HTMLInputElement).value)
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement
                          updateGoalAmount(goal.id, input.value)
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingGoal(null)}>
                        {t("cancel")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => setEditingGoal(goal.id)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {t("updateAmount")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addGoal")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("goalName")}</Label>
              <Input
                placeholder={t("goalNamePlaceholder")}
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("targetAmount")}</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("currentAmount")}</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newGoal.currentAmount}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>
                {t("deadline")} ({t("optional")})
              </Label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addGoal} className="flex-1">
                {t("add")}
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                {t("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("manageCategories")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("defaultCategories")}</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <div key={cat} className="px-3 py-1 bg-secondary rounded-full text-sm">
                    {cat}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("customCategories")}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t("categoryName")}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
                />
                <Button onClick={addCustomCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {customCategories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-2 border rounded">
                    <span>{cat}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeCustomCategory(cat)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
