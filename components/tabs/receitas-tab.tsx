"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, DollarSign, Calendar, Tag, Settings } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MonthSelector } from "@/components/month-selector"
import { useTheme } from "@/lib/theme-context"
import { translations } from "@/lib/translations"
import { getLocale } from "@/lib/month-utils"

interface Receita {
  id: string
  nome: string
  valor: number
  data: string
  categoria: string
}

interface ReceitasTabProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function ReceitasTab({ currentMonth, onMonthChange }: ReceitasTabProps) {
  const { language } = useTheme()
  const t = translations[language]
  const locale = getLocale(language)

  const [receitas, setReceitas] = useState<Receita[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const defaultCategories =
    language === "en"
      ? ["Salary", "Freelance", "Investments", "Bonus", "Other"]
      : ["Salário", "Freelance", "Investimentos", "Bônus", "Outros"]
  const allCategories = [...defaultCategories, ...customCategories]

  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: defaultCategories[0],
  })

  useEffect(() => {
    const monthKey = `month_${currentMonth}`
    const saved = localStorage.getItem(`${monthKey}_receitas`)
    if (saved) {
      setReceitas(JSON.parse(saved))
    } else {
      setReceitas([])
    }
    const savedCategories = localStorage.getItem("receitas_custom_categories")
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories))
    }
  }, [currentMonth])

  useEffect(() => {
    const monthKey = `month_${currentMonth}`
    localStorage.setItem(`${monthKey}_receitas`, JSON.stringify(receitas))
  }, [receitas, currentMonth])

  useEffect(() => {
    localStorage.setItem("receitas_custom_categories", JSON.stringify(customCategories))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Adding receita with imposto:", formData.imposto)

    const newReceita: Receita = {
      id: editingId || Date.now().toString(),
      nome: formData.nome,
      valor: Number.parseFloat(formData.valor),
      data: formData.data,
      categoria: formData.categoria,
    }

    if (editingId) {
      setReceitas(receitas.map((r) => (r.id === editingId ? newReceita : r)))
      setEditingId(null)
    } else {
      setReceitas([...receitas, newReceita])
    }

    setFormData({
      nome: "",
      valor: "",
      data: new Date().toISOString().split("T")[0],
      categoria: defaultCategories[0],
    })
    setShowForm(false)
  }

  const handleEdit = (receita: Receita) => {
    setFormData({
      nome: receita.nome,
      valor: receita.valor.toString(),
      data: receita.data,
      categoria: receita.categoria,
    })
    setEditingId(receita.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setReceitas(receitas.filter((r) => r.id !== id))
  }

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0)

  return (
    <div className="p-4 pb-24 space-y-4 max-w-2xl mx-auto">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pretty">{t.income}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.manageIncomeSources}</p>
          </div>
          <Sheet open={showCategoryManager} onOpenChange={setShowCategoryManager}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <SheetHeader>
                <SheetTitle>{t.manageCategories}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>{t.addCategory}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.categoryName}
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
                  <Label>{t.defaultCategories}</Label>
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
                    <Label>{t.customCategories}</Label>
                    <div className="flex flex-wrap gap-2">
                      {customCategories.map((cat) => (
                        <div
                          key={cat}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm flex items-center gap-2"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => removeCustomCategory(cat)}
                            className="hover:text-destructive"
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
        </div>
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthChange={onMonthChange} />

      <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-1">
            <p className="text-sm opacity-90 font-medium">{t.totalMonthlyIncome}</p>
            <h2 className="text-4xl font-bold tracking-tight">
              {language === "en" ? "$" : "R$"} {totalReceitas.toLocaleString(locale, { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </CardContent>
      </Card>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full shadow-lg h-14 text-base" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {t.addIncome}
        </Button>
      )}

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg text-white">
                <DollarSign className="h-6 w-6" />
              </div>
              {editingId ? t.editIncome : t.addIncome}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6 pb-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t.incomeName} <span className="text-primary">*</span>
              </Label>
              <Input
                placeholder={t.incomeNamePlaceholder}
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="h-14 text-base border-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t.category} <span className="text-primary">*</span>
              </Label>
              <select
                className="flex h-14 w-full rounded-md border-2 border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t.totalAmount} <span className="text-primary">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                  {language === "en" ? "$" : "R$"}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                  className="h-14 text-xl font-semibold pl-12 border-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t.date} <span className="text-primary">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  className="h-14 text-base pl-12 border-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-14 text-base border-2 bg-transparent"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    nome: "",
                    valor: "",
                    data: new Date().toISOString().split("T")[0],
                    categoria: defaultCategories[0],
                  })
                }}
              >
                {t.cancel}
              </Button>
              <Button type="submit" className="flex-1 h-14 text-base font-semibold shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                {editingId ? t.update : t.add}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <div className="space-y-3">
        {receitas.length === 0 && !showForm && (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{t.noIncomeRegistered}</p>
              <p className="text-sm mt-1">{t.addIncomeSourcesToGetStarted}</p>
            </CardContent>
          </Card>
        )}

        {receitas.map((receita) => (
          <Card key={receita.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{receita.nome}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{receita.categoria}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(receita.data).toLocaleDateString(locale)}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {language === "en" ? "$" : "R$"}{" "}
                    {receita.valor.toLocaleString(locale, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(receita)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(receita.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
