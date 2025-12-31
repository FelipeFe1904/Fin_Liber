"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, Receipt, Plus, DollarSign } from "lucide-react"
import { MonthSelector } from "@/components/month-selector"
import { getPreviousMonthKey } from "@/lib/month-utils"
import { useTheme } from "@/lib/theme-context"
import { Badge } from "@/components/ui/badge"

interface ResumoTabProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function ResumoTab({ currentMonth, onMonthChange }: ResumoTabProps) {
  const { t } = useTheme()
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [taxes, setTaxes] = useState(0)
  const [previousBalance, setPreviousBalance] = useState(0)
  const [incomeByCategory, setIncomeByCategory] = useState<Record<string, number>>({})
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({})

  useEffect(() => {
    const monthKey = `month_${currentMonth}`

    const receitas = JSON.parse(localStorage.getItem(`${monthKey}_receitas`) || "[]")
    const despesas = JSON.parse(localStorage.getItem(`${monthKey}_despesas`) || "[]")
    const impostos = JSON.parse(localStorage.getItem(`${monthKey}_impostos`) || "{}")

    const totalIncome = receitas.reduce((sum: number, r: any) => sum + r.valor, 0)
    const totalExpenses = despesas.reduce((sum: number, d: any) => (d.isPaid ? sum + d.amount : sum), 0)
    const totalTaxes = (impostos.impostoRenda || 0) + (impostos.impostoMercado || 0)

    const incomeCategories: Record<string, number> = {}
    receitas.forEach((r: any) => {
      incomeCategories[r.categoria] = (incomeCategories[r.categoria] || 0) + r.valor
    })

    const expensesCategories: Record<string, number> = {}
    despesas.forEach((d: any) => {
      if (d.isPaid) {
        expensesCategories[d.category] = (expensesCategories[d.category] || 0) + d.amount
      }
    })

    setIncome(totalIncome)
    setExpenses(totalExpenses)
    setTaxes(totalTaxes)
    setIncomeByCategory(incomeCategories)
    setExpensesByCategory(expensesCategories)

    const prevMonthKey = getPreviousMonthKey(currentMonth)
    const prevBalance = Number.parseFloat(localStorage.getItem(`month_${prevMonthKey}_balance`) || "0")
    setPreviousBalance(prevBalance)
  }, [currentMonth])

  const monthBalance = income - expenses - taxes
  const totalBalance = previousBalance + monthBalance

  useEffect(() => {
    localStorage.setItem(`month_${currentMonth}_balance`, totalBalance.toString())
  }, [totalBalance, currentMonth])

  return (
    <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-balance">{t("financialSummary")}</h1>
            <p className="text-muted-foreground text-sm">{t("summarySubtitle")}</p>
          </div>
        </div>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthChange={onMonthChange} />

      {previousBalance !== 0 && (
        <Card className="border-2 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t("previousBalance")}
                </p>
                <p className={`text-3xl font-bold ${previousBalance >= 0 ? "text-primary" : "text-destructive"}`}>
                  R$ {previousBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden shadow-xl border-0">
        <CardContent className="p-8 relative">
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 opacity-90" />
                <p className="text-sm opacity-90 font-semibold uppercase tracking-wide">{t("monthBalance")}</p>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                R$ {monthBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h2>
            </div>

            {previousBalance !== 0 && (
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm opacity-90 font-medium mb-1">{t("totalBalance")}</p>
                <h3 className="text-3xl font-bold">
                  R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
            )}

            <div className="flex items-center gap-2">
              {monthBalance >= 0 ? (
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {t("positive")}
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-white/20 hover:bg-white/30 border-0 backdrop-blur-sm">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {t("attention")}
                </Badge>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-2xl" />
        </CardContent>
      </Card>

      {income === 0 && (
        <Card className="border-2 border-dashed shadow-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t("startNow")}</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("startDescription")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all border-2 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  +
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t("incomeLabel")}</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-2 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10">
                  <Receipt className="h-5 w-5 text-destructive" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  -
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t("expensesLabel")}</p>
                <p className="text-3xl font-bold text-destructive">
                  R$ {expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-2 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                  <Receipt className="h-5 w-5 text-blue-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  -
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t("taxesLabel")}</p>
                <p className="text-3xl font-bold text-blue-500">
                  R$ {taxes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {(Object.keys(incomeByCategory).length > 0 || Object.keys(expensesByCategory).length > 0) && (
        <Card className="border-2 shadow-md">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              {t("byCategory")}
            </h3>

            {Object.keys(incomeByCategory).length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t("incomeLabel")}
                </p>
                <div className="space-y-2">
                  {Object.entries(incomeByCategory).map(([category, total]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <span className="font-medium">{category}</span>
                      <span className="font-bold text-primary">
                        R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(expensesByCategory).length > 0 && (
              <div className="space-y-3 pt-3 border-t-2">
                <p className="text-sm font-semibold text-destructive uppercase tracking-wide flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  {t("expensesLabel")}
                </p>
                <div className="space-y-2">
                  {Object.entries(expensesByCategory).map(([category, total]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center p-3 bg-destructive/5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <span className="font-medium">{category}</span>
                      <span className="font-bold text-destructive">
                        R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {income > 0 && (
        <Card className="border-2 shadow-md">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              {t("distribution")}
            </h3>
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    {t("expensesLabel")}
                  </span>
                  <span className="font-bold text-lg">{((expenses / income) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-destructive to-destructive/80 rounded-full transition-all duration-500"
                    style={{ width: `${(expenses / income) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    {t("taxesLabel")}
                  </span>
                  <span className="font-bold text-lg">{((taxes / income) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${(taxes / income) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {t("leftover")}
                  </span>
                  <span className="font-bold text-lg text-primary">
                    {((Math.max(0, monthBalance) / income) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                    style={{ width: `${(Math.max(0, monthBalance) / income) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
