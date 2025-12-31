"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingDown, AlertTriangle, LogOut, Receipt, Copy, Check, FileCode } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { getCurrentMonthKey } from "@/lib/month-utils"
import { useTheme } from "@/lib/theme-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const MASCOT_AVATARS = [
  "/cute-blue-cartoon-character.jpg",
  "/happy-green-mascot.jpg",
  "/friendly-orange-character.jpg",
  "/playful-purple-mascot.jpg",
  "/cheerful-pink-character.jpg",
  "/cool-red-mascot.jpg",
]

export function PerfilTab() {
  const { t } = useTheme()

  const [receitas, setReceitas] = useState<any[]>([])
  const [despesas, setDespesas] = useState<any[]>([])
  const [dividas, setDividas] = useState<any[]>([])
  const [impostos, setImpostos] = useState(0)
  const [exportCode, setExportCode] = useState("")
  const [importCode, setImportCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileAvatar, setProfileAvatar] = useState("")
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [tempName, setTempName] = useState("")
  const [tempAvatar, setTempAvatar] = useState("")

  useEffect(() => {
    const savedName = localStorage.getItem("profile_name") || "User"
    const savedAvatar = localStorage.getItem("profile_avatar") || MASCOT_AVATARS[0]
    setProfileName(savedName)
    setProfileAvatar(savedAvatar)
    setTempName(savedName)
    setTempAvatar(savedAvatar)
  }, [])

  const handleSaveProfile = () => {
    localStorage.setItem("profile_name", tempName)
    localStorage.setItem("profile_avatar", tempAvatar)
    setProfileName(tempName)
    setProfileAvatar(tempAvatar)
    setIsProfileDialogOpen(false)
    window.location.reload()
  }

  useEffect(() => {
    const currentMonth = getCurrentMonthKey()
    const monthKey = `month_${currentMonth}`

    console.log("[v0] Loading data for month:", monthKey)

    // Load receitas
    const receitasSalvas = localStorage.getItem(`${monthKey}_receitas`)
    if (receitasSalvas) {
      const parsed = JSON.parse(receitasSalvas)
      console.log("[v0] Loaded receitas:", parsed)
      setReceitas(parsed)
    } else {
      setReceitas([])
    }

    // Load despesas
    const despesasSalvas = localStorage.getItem(`${monthKey}_despesas`)
    if (despesasSalvas) {
      const parsed = JSON.parse(despesasSalvas)
      console.log("[v0] Loaded despesas:", parsed)
      setDespesas(parsed)
    } else {
      setDespesas([])
    }

    // Load dividas
    const dividasSalvas = localStorage.getItem(`${monthKey}_dividas`)
    if (dividasSalvas) {
      const parsed = JSON.parse(dividasSalvas)
      console.log("[v0] Loaded dividas:", parsed)
      setDividas(parsed)
    } else {
      setDividas([])
    }

    // Load impostos
    const impostosData = localStorage.getItem(`${monthKey}_impostos`)
    if (impostosData) {
      const parsed = JSON.parse(impostosData)
      const total = (parsed.impostoRenda || 0) + (parsed.impostoMercado || 0)
      console.log("[v0] Loaded impostos:", parsed, "Total:", total)
      setImpostos(total)
    } else {
      setImpostos(0)
    }
  }, [])

  const generateExportCode = () => {
    // Get all months data
    const allData: any = {
      receitas_custom_categories: localStorage.getItem("receitas_custom_categories"),
      despesas_custom_categories: localStorage.getItem("despesas_custom_categories"),
      dividas_custom_categories: localStorage.getItem("dividas_custom_categories"),
      previousBalances: localStorage.getItem("previousBalances"),
    }

    // Get all month-specific data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("month_")) {
        allData[key] = localStorage.getItem(key)
      }
    })

    const code = btoa(JSON.stringify(allData))
    setExportCode(code)
  }

  const handleImport = () => {
    try {
      const decoded = JSON.parse(atob(importCode))

      Object.keys(decoded).forEach((key) => {
        if (decoded[key]) {
          localStorage.setItem(key, decoded[key])
        }
      })

      alert("Dados importados com sucesso!")
      window.location.reload()
    } catch (error) {
      alert("Código inválido. Verifique e tente novamente.")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    if (confirm("Tem certeza que deseja recomeçar? Todos os seus dados serão apagados.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const totalReceitas = receitas.reduce((sum, r) => sum + (r.valor || 0), 0)
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0)
  const totalDividas = dividas.reduce((sum, d) => sum + (d.valor || 0), 0)
  const totalGastos = totalDespesas + totalDividas

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("profileTitle")}</h1>
          <p className="text-muted-foreground">{t("profileSubtitle")}</p>
        </div>
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileAvatar || "/placeholder.svg"} alt={profileName} />
                <AvatarFallback>{profileName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{profileName}</p>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editProfile")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div>
                <Label>{t("profileName")}</Label>
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={t("enterName")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="mb-3 block">{t("chooseAvatar")}</Label>
                <div className="grid grid-cols-3 gap-4">
                  {MASCOT_AVATARS.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setTempAvatar(avatar)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        tempAvatar === avatar
                          ? "border-primary ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Avatar className="h-20 w-20 rounded-none">
                        <AvatarImage src={avatar || "/placeholder.svg"} alt={`Mascot ${index + 1}`} />
                        <AvatarFallback>M{index + 1}</AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} className="flex-1">
                  {t("cancel")}
                </Button>
                <Button onClick={handleSaveProfile} className="flex-1">
                  {t("save")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Display Summary */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("totalIncomes")}</p>
              <p className="text-2xl font-bold text-primary">
                R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {receitas.length} {t("incomeSources")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <TrendingDown className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("monthlyExpenses")}</p>
              <p className="text-2xl font-bold text-destructive">
                R$ {totalGastos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("expenses")}: R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | {t("goals")}
                : R$ {totalDividas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Receipt className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("taxesPaid")}</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {impostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            {t("dataBackup")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("dataBackupDescription")}</p>

          <Sheet>
            <SheetTrigger asChild>
              <Button onClick={generateExportCode} className="w-full bg-transparent" variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                {t("generateCode")}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>{t("yourExportCode")}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-muted-foreground">{t("codeDescription")}</p>
                <Textarea value={exportCode} readOnly className="min-h-[200px] font-mono text-xs" />
                <Button onClick={handleCopy} className="w-full" size="lg">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t("copyCodeButton")}
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showImport} onOpenChange={setShowImport}>
            <SheetTrigger asChild>
              <Button className="w-full bg-transparent" variant="outline">
                <FileCode className="mr-2 h-4 w-4" />
                {t("importCodeButton")}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>{t("importDataTitle")}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>{t("pasteCode")}</Label>
                  <Textarea
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder={t("pasteCodePlaceholder")}
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>
                <Button onClick={handleImport} className="w-full" size="lg">
                  {t("importDataButton")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold">{t("tips")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t("tip1")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t("tip2")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t("tip3")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t("tip4")}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Warning Card */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-100">{t("importantWarning")}</p>
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed">{t("warningMessage")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button onClick={handleReset} variant="destructive" className="w-full" size="lg">
        <LogOut className="mr-2 h-5 w-5" />
        {t("resetData")}
      </Button>
    </div>
  )
}
