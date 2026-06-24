import { useTranslation } from "react-i18next"
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export interface DetailField {
    label: string
    value: React.ReactNode
}

interface HistoriqueDetailButtonProps {
    fields: DetailField[]
}

// Bouton "⋮" générique (même langage visuel que LaverieActions dans optionsButton.tsx) —
// largeur de colonne fixe, indépendante de la longueur des champs affichés dans le drawer.
export function HistoriqueDetailButton({ fields }: HistoriqueDetailButtonProps) {
    const { t } = useTranslation()

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('histo_detail_voir')}>
                    ⋮
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{t('histo_detail_titre')}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 space-y-3">
                    {fields.map((field, i) => (
                        <div key={i}>
                            <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">{field.value}</p>
                        </div>
                    ))}
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="secondary" className="w-full" type="button">
                            {t('histo_detail_fermer')}
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
