import countries from "i18n-iso-countries"
import fr from "i18n-iso-countries/langs/fr.json"
import en from "i18n-iso-countries/langs/en.json"

countries.registerLocale(fr)
countries.registerLocale(en)

/**
 * TODO(human): Implémente cette fonction.
 *
 * Problème : le SIREN retourne 'France' (français), Wi-Line retourne 'France'
 * ou parfois 'Germany' (anglais). L'API editLaundry retourne le pays en français.
 * On veut toujours stocker le nom en français dans le state React.
 *
 * La fonction doit :
 * 1. Si `raw` est vide → retourner ''
 * 2. Chercher dans les noms français si `raw` matche exactement → retourner ce nom
 * 3. Sinon chercher dans les noms anglais si `raw` matche exactement
 *    → trouver le code ISO correspondant → retourner le nom français de ce pays
 * 4. Sinon retourner `raw` tel quel (fallback)
 *
 * Exemple :
 *   normalizeCountry('France')  → 'France'   (match direct FR)
 *   normalizeCountry('Germany') → 'Allemagne' (match EN → converti en FR)
 *   normalizeCountry('')        → ''
 */
export function normalizeCountry(raw: string): string {
    if (!raw) {
        return ''; 
    }
    const frNames = countries.getNames('fr')
    if (Object.values(frNames).includes(raw)) {
        return raw
    }
    
    const enNames = countries.getNames('en')
    const entry = Object.entries(enNames).find(([, name]) => name === raw) 
    if (entry) {
        const frName = countries.getName(entry[0], 'fr')
        if (frName) {
            return frName; 
        }
    }

    return raw
}
