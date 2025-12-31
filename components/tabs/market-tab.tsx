"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, ShoppingCart, Package, CheckCircle2, FolderPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/lib/theme-context"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InventoryItem {
  id: string
  name: string
  currentQuantity: number
  idealQuantity: number
  unit: string
  category: string
}

interface ShoppingListItem extends InventoryItem {
  quantityToBuy: number
}

const DEFAULT_CATEGORIES = ["Food", "Beverages", "Cleaning", "Personal Care", "Other"]
const DEFAULT_CATEGORIES_PT = ["Alimentos", "Bebidas", "Limpeza", "Higiene Pessoal", "Outros"]

export function MarketTab() {
  const { t, language } = useTheme()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [activeView, setActiveView] = useState<"inventory" | "shopping">("inventory")
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const defaultCategories = language === "pt" ? DEFAULT_CATEGORIES_PT : DEFAULT_CATEGORIES
  const categories = [...defaultCategories, ...customCategories]

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    currentQuantity: "",
    idealQuantity: "",
    unit: "",
    category: categories[0],
  })

  useEffect(() => {
    const savedCustomCategories = localStorage.getItem("market_custom_categories")
    if (savedCustomCategories) {
      setCustomCategories(JSON.parse(savedCustomCategories))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("market_custom_categories", JSON.stringify(customCategories))
  }, [customCategories])

  useEffect(() => {
    const savedItems = localStorage.getItem("market_inventory")
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("market_inventory", JSON.stringify(items))
  }, [items])

  const resetForm = () => {
    setFormData({
      name: "",
      currentQuantity: "",
      idealQuantity: "",
      unit: "",
      category: categories[0],
    })
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    if (categories.includes(newCategoryName.trim())) return

    setCustomCategories([...customCategories, newCategoryName.trim()])
    setNewCategoryName("")
    setIsCategoryDialogOpen(false)
  }

  const handleDeleteCategory = (categoryName: string) => {
    if (defaultCategories.includes(categoryName)) return
    setCustomCategories(customCategories.filter((c) => c !== categoryName))
  }

  const handleAddItem = () => {
    if (!formData.name || !formData.currentQuantity || !formData.idealQuantity || !formData.unit) return

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name,
      currentQuantity: Number.parseFloat(formData.currentQuantity),
      idealQuantity: Number.parseFloat(formData.idealQuantity),
      unit: formData.unit,
      category: formData.category,
    }

    setItems([...items, newItem])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditItem = () => {
    if (!editingItem || !formData.name || !formData.currentQuantity || !formData.idealQuantity || !formData.unit) return

    setItems(
      items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name,
              currentQuantity: Number.parseFloat(formData.currentQuantity),
              idealQuantity: Number.parseFloat(formData.idealQuantity),
              unit: formData.unit,
              category: formData.category,
            }
          : item,
      ),
    )
    setIsEditDialogOpen(false)
    setEditingItem(null)
    resetForm()
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      currentQuantity: item.currentQuantity.toString(),
      idealQuantity: item.idealQuantity.toString(),
      unit: item.unit,
      category: item.category,
    })
    setIsEditDialogOpen(true)
  }

  const generateShoppingList = () => {
    const list: ShoppingListItem[] = items
      .filter((item) => item.currentQuantity < item.idealQuantity)
      .map((item) => ({
        ...item,
        quantityToBuy: item.idealQuantity - item.currentQuantity,
      }))

    setShoppingList(list)
    setActiveView("shopping")
  }

  const markAsBought = (id: string) => {
    const item = shoppingList.find((i) => i.id === id)
    if (!item) return

    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              currentQuantity: i.idealQuantity,
            }
          : i,
      ),
    )

    setShoppingList(shoppingList.filter((i) => i.id !== id))
  }

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min((item.currentQuantity / item.idealQuantity) * 100, 100)
  }

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, InventoryItem[]>,
  )

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("marketTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("marketSubtitle")}</p>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "inventory" | "shopping")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            {t("currentStock")}
          </TabsTrigger>
          <TabsTrigger value="shopping" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t("shoppingList")}
            {shoppingList.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {shoppingList.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addItem")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("addItem")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{t("itemName")}</Label>
                    <Input
                      placeholder={t("itemNamePlaceholder")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("currentQuantity")}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.currentQuantity}
                        onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{t("idealQuantity")}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.idealQuantity}
                        onChange={(e) => setFormData({ ...formData, idealQuantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("unit")}</Label>
                    <Input
                      placeholder={t("unitPlaceholder")}
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{t("category")}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCategoryDialogOpen(true)}
                        className="h-7 text-xs"
                      >
                        <FolderPlus className="h-3 w-3 mr-1" />
                        {t("manageCategories")}
                      </Button>
                    </div>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleAddItem} className="flex-1">
                      {t("add")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="secondary" onClick={generateShoppingList} disabled={items.length === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("generateShoppingList")}
            </Button>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t("noItems")}</h3>
                <p className="text-sm text-muted-foreground text-center">{t("noItemsDescription")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-3">{category}</h3>
                  <div className="space-y-3">
                    {categoryItems.map((item) => {
                      const percentage = getStockPercentage(item)
                      const needsToBuy = item.currentQuantity < item.idealQuantity

                      return (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{item.name}</h4>
                                  {needsToBuy && (
                                    <Badge variant="destructive" className="text-xs">
                                      {t("needToBuy")}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.currentQuantity} / {item.idealQuantity} {item.unit}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4 mt-4">
          {shoppingList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t("noShoppingItems")}</h3>
                <Button variant="outline" onClick={() => setActiveView("inventory")} className="mt-4">
                  {t("backToInventory")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle>{t("shoppingList")}</CardTitle>
                  <CardDescription>
                    {shoppingList.length} {shoppingList.length === 1 ? "item" : "items"}
                  </CardDescription>
                </CardHeader>
              </Card>

              {shoppingList.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.quantityToBuy.toFixed(1)} {item.unit}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {item.category}
                        </Badge>
                      </div>
                      <Button variant="default" size="sm" onClick={() => markAsBought(item.id)} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("markAsBought")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("manageCategories")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t("addCategory")}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder={t("categoryName")}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">{t("defaultCategories")}</Label>
              <div className="flex flex-wrap gap-2">
                {defaultCategories.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {customCategories.length > 0 && (
              <div>
                <Label className="mb-2 block">{t("customCategories")}</Label>
                <div className="flex flex-wrap gap-2">
                  {customCategories.map((cat) => (
                    <Badge key={cat} variant="outline" className="gap-1">
                      {cat}
                      <button onClick={() => handleDeleteCategory(cat)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t("itemName")}</Label>
              <Input
                placeholder={t("itemNamePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("currentQuantity")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.currentQuantity}
                  onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("idealQuantity")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.idealQuantity}
                  onChange={(e) => setFormData({ ...formData, idealQuantity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{t("unit")}</Label>
              <Input
                placeholder={t("unitPlaceholder")}
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("category")}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button onClick={handleEditItem} className="flex-1">
                {t("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
