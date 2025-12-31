export function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function getMonthDisplay(monthKey: string, locale = "en-US") {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" })
}

export function getPreviousMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function getNextMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  date.setMonth(date.getMonth() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function getAllMonthKeys(): string[] {
  if (typeof window === "undefined") return []

  const keys = Object.keys(localStorage).filter((key) => key.startsWith("month_"))
  const monthKeys = keys.map((key) => key.replace("month_", ""))
  return Array.from(new Set(monthKeys)).sort()
}

export function getLocale(language: string): string {
  return language === "en" ? "en-US" : "pt-BR"
}
