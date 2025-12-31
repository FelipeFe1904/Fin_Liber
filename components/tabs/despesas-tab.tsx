"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Receipt, Settings, Trash2, Calendar, Check, AlertCircle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { MonthSelector } from "@/components/month-selector"
import { useTheme } from "@/lib/theme-context"
import { Badge } from "@/components/ui/badge"

interface Expense {
  id: string
  name: string
  amount: number
  tax?: number
  category: string
  dueDate?: string
  isPaid: boolean
}

interface DespesasTabProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function DespesasTab({ currentMonth, onMonthChange }: DespesasTabProps) {
  const { t } = useTheme()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [addingExpense, setAddingExpense] = useState(false)
  const [includeTax, setIncludeTax] = useState(false)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const defaultCategories = ["Aluguel", "Condomínio", "Água", "Luz", "Internet", "Alimentação", "Transporte", "Outros"]
  const allCategories = [...defaultCategories, ...customCategories]

  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    tax: "",
    category: defaultCategories[0],
    dueDate: "",
    isPaid: true,
  })

  useEffect(() => {
    const monthKey = `month_${currentMonth}`
    const saved = localStorage.getItem(`${monthKey}_despesas`)
    if (saved) {
      setExpenses(JSON.parse(saved))
    } else {
      setExpenses([])
    }

    const savedCategories = localStorage.getItem("despesas_custom_categories")
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories))
    }
  }, [currentMonth])

  useEffect(() => {
    localStorage.setItem("despesas_custom_categories", JSON.stringify(customCategories))
  }, [customCategories])

  const addCustomCategory = () => {
    if (newCategory && !allCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory])
      setNewCategory("")
    }
  }

  const removeCustomCategory = (category: string) => {
    setCustomCategories(customCategories.filter((c) => c !== category))
  }

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses)
    const monthKey = `month_${currentMonth}`
    localStorage.setItem(`${monthKey}_despesas`, JSON.stringify(newExpenses))
  }

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: Number.parseFloat(newExpense.amount),
      category: newExpense.category,
      isPaid: newExpense.isPaid,
    }

    if (newExpense.dueDate) {
      expense.dueDate = newExpense.dueDate
    }

    if (includeTax && newExpense.tax && newExpense.tax !== "") {
      expense.tax = Number.parseFloat(newExpense.tax)
    }

    saveExpenses([...expenses, expense])
    setNewExpense({ name: "", amount: "", tax: "", category: defaultCategories[0], dueDate: "", isPaid: true })
    setIncludeTax(false)
    setAddingExpense(false)
  }

  const removeExpense = (id: string) => {
    saveExpenses(expenses.filter((e) => e.id !== id))
  }

  const togglePaid = (id: string) => {
    const updatedExpenses = expenses.map((e) => (e.id === id ? { ...e, isPaid: !e.isPaid } : e))
    saveExpenses(updatedExpenses)
  }

  const totalExpenses = expenses.reduce((sum, e) => (e.isPaid ? sum + e.amount : sum), 0)
  const pendingExpenses = expenses.filter((e) => !e.isPaid)
  const paidExpenses = expenses.filter((e) => e.isPaid)

  const isOverdue = (expense: Expense) => {
    if (!expense.dueDate || expense.isPaid) return false
    const today = new Date()
    const dueDate = new Date(expense.dueDate)
    return dueDate < today
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-2xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Receipt className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">{t("expenses")}</h1>
          </div>
          <div className="space-y-1">
            <p className="text-white/90 text-sm">{t("expensesDescription")}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-white/80 text-sm">
                {t("total")} {t("expensesLabel").toLowerCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mb-8" />
      </div>

      <div className="flex items-center justify-between">
        <MonthSelector currentMonth={currentMonth} onMonthChange={onMonthChange} />
        <div className="flex gap-2">
          <Sheet open={showCategoryManager} onOpenChange={setShowCategoryManager}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <SheetHeader>
                <SheetTitle>{t("manageCategories")}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>{t("addCategory")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("categoryName")}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
                    />
                    <Button onClick={addCustomCategory} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("defaultCategories")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {defaultCategories.map((cat) => (
                      <div key={cat} className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>

                {customCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("customCategories")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {customCategories.map((cat) => (
                        <div
                          key={cat}
                          className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => removeCustomCategory(cat)}
                            className="hover:text-destructive/70"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Button
            onClick={() => setAddingExpense(true)}
            size="icon"
            className="rounded-full shadow-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {pendingExpenses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-lg">{t("pendingBills")}</h2>
            <Badge variant="secondary">{pendingExpenses.length}</Badge>
          </div>
          {pendingExpenses.map((expense) => (
            <Card
              key={expense.id}
              className={`shadow-md hover:shadow-lg transition-all border-l-4 ${isOverdue(expense) ? "border-l-red-600" : "border-l-rose-500"}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{expense.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                      {isOverdue(expense) && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {t("overdue")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    {expense.dueDate && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t("dueDate")}: {new Date(expense.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                    {expense.tax && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("taxesLabel")}: R$ {expense.tax.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => togglePaid(expense.id)}
                      className="whitespace-nowrap bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {t("markAsPaid")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeExpense(expense.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {paidExpenses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">{t("paidBills")}</h2>
            <Badge variant="outline">{paidExpenses.length}</Badge>
          </div>
          {paidExpenses.map((expense) => (
            <Card
              key={expense.id}
              className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500 opacity-70"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg line-through decoration-muted-foreground">{expense.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                      <Badge className="text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {t("paid")}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-muted-foreground line-through">
                      R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    {expense.dueDate && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t("dueDate")}: {new Date(expense.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                    {expense.tax && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("taxesLabel")}: R$ {expense.tax.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePaid(expense.id)}
                      className="whitespace-nowrap"
                    >
                      {t("markAsUnpaid")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeExpense(expense.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {expenses.length === 0 && (
        <Card className="shadow-md border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-muted-foreground">{t("noExpenses")}</p>
              <p className="text-sm text-muted-foreground">{t("expensesDescription")}</p>
              <Button onClick={() => setAddingExpense(true)} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t("addExpense")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Sheet open={addingExpense} onOpenChange={setAddingExpense}>
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg text-white">
                <Receipt className="h-6 w-6" />
              </div>
              {t("addExpense")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="expense-name" className="font-semibold text-base">
                {t("expenseName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expense-name"
                placeholder="Ex: Aluguel, Internet, Luz..."
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                className="h-14 text-base border-2 focus-visible:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-category" className="font-semibold text-base">
                {t("expenseCategory")} <span className="text-red-500">*</span>
              </Label>
              <select
                id="expense-category"
                className="flex h-14 w-full rounded-md border-2 border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount" className="font-semibold text-base">
                {t("expenseValue")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                  R$
                </span>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="h-14 text-xl font-semibold pl-12 border-2 focus-visible:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-due-date" className="font-semibold text-base">
                {t("dueDate")} <span className="text-muted-foreground font-normal text-sm">({t("optional")})</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="expense-due-date"
                  type="date"
                  value={newExpense.dueDate}
                  onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                  className="h-14 text-base pl-12 border-2 focus-visible:ring-red-500"
                />
              </div>
            </div>

            <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-900">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="is-paid"
                    checked={newExpense.isPaid}
                    onCheckedChange={(checked) => setNewExpense({ ...newExpense, isPaid: checked === true })}
                    className="mt-1 border-red-400 data-[state=checked]:bg-red-600"
                  />
                  <div className="flex-1">
                    <Label htmlFor="is-paid" className="font-semibold text-base cursor-pointer">
                      {t("markAsPaidNow")}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Se já foi paga, será descontada do seu saldo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-2">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="include-tax"
                    checked={includeTax}
                    onCheckedChange={(checked) => setIncludeTax(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="include-tax" className="font-semibold text-base cursor-pointer">
                      {t("includeTax")}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Informe se há impostos incluídos no valor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {includeTax && (
              <div className="space-y-2 animate-in slide-in-from-top">
                <Label htmlFor="expense-tax" className="font-semibold text-base">
                  {t("taxValue")}
                </Label>
                <Input
                  id="expense-tax"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newExpense.tax}
                  onChange={(e) => setNewExpense({ ...newExpense, tax: e.target.value })}
                  className="h-14 text-base border-2 focus-visible:ring-red-500"
                />
                <p className="text-xs text-muted-foreground">{t("taxDescription")}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-14 text-base border-2 bg-transparent"
                onClick={() => {
                  setAddingExpense(false)
                  setNewExpense({
                    name: "",
                    amount: "",
                    tax: "",
                    category: defaultCategories[0],
                    dueDate: "",
                    isPaid: true,
                  })
                  setIncludeTax(false)
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={addExpense}
                className="flex-1 h-14 text-base font-semibold shadow-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                {t("add")} {t("expensesLabel")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
