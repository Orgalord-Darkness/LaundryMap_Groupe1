import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Sun, Moon, Monitor } from "lucide-react"
import { PersonalSpaceNavbar, TAB_ROUTES, type PersonalSpaceTab } from "@/components/ui/PersonalSpaceNavbar"
import { Button } from "@/components/ui/button"
import { usePreferences, type Theme, type Language } from "@/components/context/PreferencesContext"

type Inputs = {
  langue: Language
  theme: Theme
}

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light",  label: "Clair",   Icon: Sun },
  { value: "dark",   label: "Sombre",  Icon: Moon },
  { value: "system", label: "Système", Icon: Monitor },
]

export default function MesPreferences() {
  const navigate = useNavigate()
  const { theme, language, setTheme, setLanguage } = usePreferences()
  const [successMessage, setSuccessMessage] = useState("")

  const { handleSubmit, watch, setValue } = useForm<Inputs>({
    defaultValues: { langue: language, theme },
  })

  const selectedTheme    = watch("theme")
  const selectedLanguage = watch("langue")

  const handleTabChange = (tab: PersonalSpaceTab) => {
    const route = TAB_ROUTES[tab]
    if (route) navigate(route)
  }

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setTheme(data.theme)
    setLanguage(data.langue)
    setSuccessMessage("Préférences enregistrées.")
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card px-4 pt-6 pb-0">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-foreground">Espace personnel</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Mes préférences</p>
          </div>
          <PersonalSpaceNavbar active="Préférences" onChange={handleTabChange} />
        </div>
      </div>

      <main className="flex-1 px-4 py-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md mx-auto flex flex-col gap-6 p-6 bg-card rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-foreground text-center mb-2">
            Mes préférences
          </h2>

          {successMessage && (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl">
              {successMessage}
            </div>
          )}

          {/* Champ Langue */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Langue</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setValue("langue", e.target.value as Language)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Champ Thème */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Thème</label>
            <div className="flex gap-3">
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("theme", value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-colors ${
                    selectedTheme === value
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border text-muted-foreground hover:border-border"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="mt-2 w-full">
            Enregistrer
          </Button>
        </form>
      </main>
    </div>
  )
}
