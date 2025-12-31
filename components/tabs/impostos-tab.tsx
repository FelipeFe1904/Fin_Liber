"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Receipt, TrendingUp, Calendar, ShoppingCart, Edit } from "lucide-react"
import { MonthSelector } from "@/components/month-selector"
import { useTheme } from "@/lib/theme-context"

interface ImpostoData {
  rendaRecebida: number
  impostoRenda: number
  gastoMercado: number
  impostoMercado: number
}

interface ImpostosTabProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function ImpostosTab({ currentMonth, onMonthChange }: ImpostosTabProps) {
  const { t } = useTheme()

  const [data, setData] = useState<ImpostoData>({
    rendaRecebida: 0,
    impostoRenda: 0,
    gastoMercado: 0,
    impostoMercado: 0,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    const monthKey = `month_${currentMonth}`
    const saved = localStorage.getItem(`${monthKey}_impostos`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setData(parsed)
      setFormData(parsed)
    } else {
      const emptyData = {
        rendaRecebida: 0,
        impostoRenda: 0,
        gastoMercado: 0,
        impostoMercado: 0,
      }
      setData(emptyData)
      setFormData(emptyData)
    }
  }, [currentMonth])

  const handleSave = () => {
    setData(formData)
    const monthKey = `month_${currentMonth}`
    localStorage.setItem(`${monthKey}_impostos`, JSON.stringify(formData))
    setIsEditing(false)
  }

  const totalImpostos = data.impostoRenda + data.impostoMercado
  const rendaLiquida = data.rendaRecebida - data.impostoRenda
  const percentualImpostoRenda = data.rendaRecebida > 0 ? (data.impostoRenda / data.rendaRecebida) * 100 : 0
  const percentualImpostoMercado = data.gastoMercado > 0 ? (data.impostoMercado / data.gastoMercado) * 100 : 0
  const percentualImpostoTotal = data.rendaRecebida > 0 ? (totalImpostos / data.rendaRecebida) * 100 : 0
  const diasTrabalhadosImpostos = Math.round((percentualImpostoTotal / 100) * 30)

  return (
    <div className="p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("taxMeter")}</h1>
          <p className="text-muted-foreground">{t("taxMeterSubtitle")}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthChange={onMonthChange} />

      {/* Edit Form */}
      {isEditing && (
        <Card className="border-primary">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">{t("editInfo")}</h3>

            <div className="space-y-2">
              <Label htmlFor="renda">{t("totalIncome")}</Label>
              <Input
                id="renda"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.rendaRecebida || ""}
                onChange={(e) => setFormData({ ...formData, rendaRecebida: Number.parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">{t("totalIncomeHelp")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imposto-renda">{t("incomeTaxPaid")}</Label>
              <Input
                id="imposto-renda"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.impostoRenda || ""}
                onChange={(e) => setFormData({ ...formData, impostoRenda: Number.parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">{t("incomeTaxPaidHelp")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasto-mercado">{t("marketSpending")}</Label>
              <Input
                id="gasto-mercado"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.gastoMercado || ""}
                onChange={(e) => setFormData({ ...formData, gastoMercado: Number.parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">{t("marketSpendingHelp")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imposto-mercado">{t("embeddedTax")}</Label>
              <Input
                id="imposto-mercado"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.impostoMercado || ""}
                onChange={(e) => setFormData({ ...formData, impostoMercado: Number.parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">{t("embeddedTaxHelp")}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1">
                {t("save")}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsEditing(false)}>
                {t("cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tax Card */}
      <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
        <CardContent className="p-6 space-y-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm opacity-90 mb-2">{t("totalTaxPaid")}</p>
              <h2 className="text-5xl font-bold mb-1 tracking-tight">
                R$ {totalImpostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-sm opacity-90">{t("inPeriod")}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Receipt className="h-10 w-10" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/30">
            <span className="text-sm opacity-90">{t("percentOfIncome")}</span>
            <span className="text-3xl font-bold">{percentualImpostoTotal.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Impact Message */}
      {diasTrabalhadosImpostos > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-500/20 p-3 rounded-xl">
                <Calendar className="h-7 w-7 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-lg text-balance text-amber-900 dark:text-amber-100">
                  {t("workingDaysForTax")} {diasTrabalhadosImpostos}{" "}
                  {diasTrabalhadosImpostos === 1 ? t("day") : t("days")} {t("workingDaysForTaxEnd")}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t("workTimePercent")} {((diasTrabalhadosImpostos / 30) * 100).toFixed(0)}% {t("workTimePercentEnd")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1 flex-1">
                <p className="text-sm text-muted-foreground font-medium">{t("incomeTax")}</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  R$ {data.impostoRenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-2 text-sm pt-3 border-t">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t("totalReceived")}</span>
                <span className="font-semibold">
                  R$ {data.rendaRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t("taxPercentage")}</span>
                <span className="font-semibold">{percentualImpostoRenda.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1 bg-primary/5 -mx-2 px-2 rounded">
                <span className="text-muted-foreground">{t("netIncome")}</span>
                <span className="font-bold text-primary">
                  R$ {rendaLiquida.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1 flex-1">
                <p className="text-sm text-muted-foreground font-medium">{t("consumptionTax")}</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  R$ {data.impostoMercado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <ShoppingCart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-2 text-sm pt-3 border-t">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t("totalSpent")}</span>
                <span className="font-semibold">
                  R$ {data.gastoMercado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{t("taxPercentage")}</span>
                <span className="font-semibold">{percentualImpostoMercado.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1 bg-primary/5 -mx-2 px-2 rounded">
                <span className="text-muted-foreground">{t("valueWithoutTax")}</span>
                <span className="font-bold text-primary">
                  R$ {(data.gastoMercado - data.impostoMercado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            {t("howItWorks")}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">💰</span>
              <p className="text-muted-foreground leading-relaxed">{t("taxExplainIncome")}</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">📊</span>
              <p className="text-muted-foreground leading-relaxed">{t("taxExplainIncomeTax")}</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🛒</span>
              <p className="text-muted-foreground leading-relaxed">{t("taxExplainMarket")}</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">📈</span>
              <p className="text-muted-foreground leading-relaxed">{t("taxExplainEmbedded")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
