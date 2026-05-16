import { useTranslation } from "react-i18next"
import countries from "i18n-iso-countries"
import fr from "i18n-iso-countries/langs/fr.json"
import en from "i18n-iso-countries/langs/en.json"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"

countries.registerLocale(fr)
countries.registerLocale(en)

interface CountrySelectProps {
    id?: string
    value: string
    onChange: (value: string) => void
    className?: string
    disabled?: boolean
}

export function CountrySelect({ id, value, onChange, className, disabled }: CountrySelectProps) {
    const { i18n } = useTranslation()
    const lang = i18n.language.startsWith("fr") ? "fr" : "en"

    const options = Object.entries(countries.getNames(lang, { select: "official" }))
      .map(([, name]) => ({ value: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {options.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
}