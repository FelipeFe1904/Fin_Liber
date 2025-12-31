"use client"

import { useState, useEffect } from "react"
import { Home, Target, User, TrendingUp, Receipt, Moon, Sun, ShoppingCart, FileText } from "lucide-react"
import { ResumoTab } from "@/components/tabs/resumo-tab"
import { MetasTab } from "@/components/tabs/metas-tab"
import { DespesasTab } from "@/components/tabs/despesas-tab"
import { ImpostosTab } from "@/components/tabs/impostos-tab"
import { PerfilTab } from "@/components/tabs/perfil-tab"
import { ReceitasTab } from "@/components/tabs/receitas-tab"
import { MarketTab } from "@/components/tabs/market-tab"
import { getCurrentMonthKey } from "@/lib/month-utils"
import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainApp() {
  const [activeTab, setActiveTab] = useState("resumo")
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthKey())
  const { theme, toggleTheme, language, setLanguage, t } = useTheme()
  const [profileName, setProfileName] = useState("")
  const [profileAvatar, setProfileAvatar] = useState("")

  useEffect(() => {
    const savedName = localStorage.getItem("profile_name") || "User"
    const savedAvatar = localStorage.getItem("profile_avatar") || ""
    setProfileName(savedName)
    setProfileAvatar(savedAvatar)
  }, [activeTab])

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileAvatar || "/placeholder.svg"} alt={profileName} />
              <AvatarFallback className="text-xs">{profileName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="font-bold text-sm leading-none">FinLiber</h2>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">{profileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "pt" : "en")}
              className="gap-2"
            >
              {language === "en" ? "🇺🇸 EN" : "🇧🇷 PT"}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "resumo" && <ResumoTab currentMonth={currentMonth} onMonthChange={setCurrentMonth} />}
        {activeTab === "receitas" && <ReceitasTab currentMonth={currentMonth} onMonthChange={setCurrentMonth} />}
        {activeTab === "despesas" && <DespesasTab currentMonth={currentMonth} onMonthChange={setCurrentMonth} />}
        {activeTab === "metas" && <MetasTab currentMonth={currentMonth} onMonthChange={setCurrentMonth} />}
        {activeTab === "impostos" && <ImpostosTab currentMonth={currentMonth} onMonthChange={setCurrentMonth} />}
        {activeTab === "market" && <MarketTab />}
        {activeTab === "perfil" && <PerfilTab />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-1">
          <button
            onClick={() => setActiveTab("resumo")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "resumo" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">{t("summary")}</span>
          </button>
          <button
            onClick={() => setActiveTab("receitas")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "receitas" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium">{t("income")}</span>
          </button>
          <button
            onClick={() => setActiveTab("despesas")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "despesas" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-xs font-medium">{t("expenses")}</span>
          </button>
          <button
            onClick={() => setActiveTab("metas")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "metas" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Target className="h-5 w-5" />
            <span className="text-xs font-medium">{t("goals")}</span>
          </button>
          <button
            onClick={() => setActiveTab("impostos")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "impostos" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">{t("taxes")}</span>
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "market" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs font-medium">{t("market")}</span>
          </button>
          <button
            onClick={() => setActiveTab("perfil")}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === "perfil" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">{t("profile")}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
