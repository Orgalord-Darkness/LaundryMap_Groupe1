
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import { CheckboxGroup } from '@/components/ui/checkboxGroup'
import WeekSchedulePicker, { type WeekSchedule, DEFAULT_WEEK_SCHEDULE, type DayKey } from '@/components/ui/timePicker'
import axios from 'axios'
import CarouselWithThumbs from '@/components/ui/carouselImage'
import CardMachine from '@/components/ui/cardMachine'
import MachineModal, { type EquipementFormData } from '@/components/ui/MachineModal'
 
const API_BASE = import.meta.env.VITE_API_BASE_URL
 
const api = axios.create({
    baseURL: `${API_BASE}/api/v1/laverie`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
})
 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
 
// ─── Mapping anglais → français pour les jours ───────────────────────────────
// WeekSchedulePicker utilise les clés anglaises (monday, tuesday…)
// mais JourEnum Symfony attend le français (lundi, mardi…)
const DAY_EN_TO_FR: Record<string, string> = {
    monday:    'lundi',
    tuesday:   'mardi',
    wednesday: 'mercredi',
    thursday:  'jeudi',
    friday:    'vendredi',
    saturday:  'samedi',
    sunday:    'dimanche',
}
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
// interface LaverieDetail {
//     id: number
//     nom_etablissement: string
//     description: string | null
//     contact_email: string | null
//     wi_line_reference: number | null
//     adresse: {
//         adresse: string
//         rue: string
//         code_postal: number
//         ville: string
//         pays: string
//         latitude: number | null
//         longitude: number | null
//     } | null
//     services: { id: number; nom: string }[]
//     methodePaiements: { id: number; nom: string }[]
//     equipements?: any[]
//     laverieFermetures?: any[]
//     logo?: string | null
//     images?: string[]
// }
 
// ─── Composant ────────────────────────────────────────────────────────────────
 
export default function FormEditLaverie() {
    const { id } = useParams<{ id: string }>()
 
    const [loading, setLoading]               = useState(true)
    const [saving, setSaving]                 = useState(false)
    const [error, setError]                   = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState("")
 
    const [name, setName]                     = useState("")
    const [contactEmail, setContactEmail]     = useState("")
    const [description, setDescription]       = useState("")
    const [wilineCode, setWilineCode]         = useState("")
    const [adresse, setAdresse]               = useState("")
    const [rue, setRue]                       = useState("")
    const [codePostal, setCodePostal]         = useState("")
    const [city, setCity]                     = useState("")
    const [country, setCountry]               = useState("")
    const [latitude, setLatitude]             = useState("")
    const [longitude, setLongitude]           = useState("")
    const [selectedServices, setSelectedServices]   = useState<string[]>([])
    const [selectedPayments, setSelectedPayments]   = useState<string[]>([])
    const [week, setWeek]                     = useState<WeekSchedule>(DEFAULT_WEEK_SCHEDULE)
    const [logo, setLogo]                     = useState<File | null>(null)
    const [images, setImages]                 = useState<FileList | null>(null)
 
    // ✅ selectedMachines = équipements (machines + sèche-linge)
    const [selectedMachines, setSelectedMachines]           = useState<EquipementFormData[]>([])
    // ✅ selectedComfortEquipments = équipements de confort (wifi, chaises…)
    // const [selectedComfortEquipments, setSelectedComfortEquipments] = useState<string[]>([])
 
    const [allServices, setAllServices]   = useState<{ id: number; nom: string }[]>([])
    const [allPaiements, setAllPaiements] = useState<{ id: number; nom: string }[]>([])
    const [errors, setErrors]             = useState<Record<string, string>>({})
 
    // ─── Utilitaires ─────────────────────────────────────────────────────────
 
    function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload  = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }
 
    // ─── Handler ajout machine depuis MachineModal ────────────────────────────
    // ✅ FIX : MachineModal appelle onAdd(data) → on l'ajoute à selectedMachines
    const handleAddMachine = (data: EquipementFormData) => {
        setSelectedMachines(prev => [...prev, data])
    }
 
    const handleRemoveMachine = (index: number) => {
        setSelectedMachines(prev => prev.filter((_, i) => i !== index))
    }
 
    // ─── Chargement options (services / paiements) ────────────────────────────
 
    useEffect(() => {
        async function fetchOptions() {
            const [servicesRes, paiementsRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/services/list`),
                fetch(`${API_BASE}/api/v1/paiements/list`)
            ])
            setAllServices(await servicesRes.json())
            setAllPaiements(await paiementsRes.json())
        }
        fetchOptions()
    }, [])
 
    // ─── Chargement laverie ───────────────────────────────────────────────────
 
    useEffect(() => {
        const fetchLaverie = async () => {
            try {
                const response = await api.get(`/${id}`);
                const data = response.data;
 
                setName(data.nom_etablissement ?? "")
                setContactEmail(data.contact_email ?? "")
                setDescription(data.description ?? "")
                setWilineCode(String(data.wi_line_reference ?? ""))
 
                if (data.adresse) {
                    setAdresse(data.adresse.adresse ?? "")
                    setRue(data.adresse.rue ?? "")
                    setCodePostal(String(data.adresse.code_postal ?? ""))
                    setCity(data.adresse.ville ?? "")
                    setCountry(data.adresse.pays ?? "")
                    setLatitude(String(data.adresse.latitude ?? ""))
                    setLongitude(String(data.adresse.longitude ?? ""))
                }
 
                setSelectedServices(
                    data.services?.map((s: {id: number, value: string}) => String(s.id)) ?? []
                )
                setSelectedPayments(
                    data.methodePaiements?.map((p: {id: number, value: string}) => String(p.id)) ?? []
                )
 
                // ✅ FIX : on remplit selectedMachines (plus selectedEquipments)
                // ✅ Dans le useEffect de chargement de la laverie :
                // ✅ Dans useEffect / fetchLaverie
               // ✅ FIX : Conversion explicite en Number pour satisfaire TypeScript et EquipementFormData
                if (data.equipements) {
                    const normalized: EquipementFormData[] = data.equipements.map((eq: any) => {
                        let type = "autre"
                        if (typeof eq.type === "string") {
                            type = eq.type.toLowerCase()
                        } else if (eq.type && typeof eq.type === "object" && eq.type.value) {
                            type = eq.type.value.toLowerCase()
                        }
                        
                        const allowed = ["machine_a_laver", "seche_linge", "autre"]
                        if (!allowed.includes(type)) type = "autre"

                        return {
                            nom:      eq.nom ?? "Équipement",
                            type:     type as EquipementFormData["type"],
                            // On force la conversion en nombre car l'API renvoie souvent des strings pour le JSON
                            capacite: eq.capacite ? Number(eq.capacite) : 0,
                            tarif:    eq.tarif    ? Number(eq.tarif)    : 0,
                            duree:    eq.duree    ? Number(eq.duree)    : 0,
                        }
                    })
                    setSelectedMachines(normalized)
                }
 
                // ─── Horaires ─────────────────────────────────────────────
                if (data.laverieFermetures) {
                    const newWeek = { ...DEFAULT_WEEK_SCHEDULE }
 
                    data.laverieFermetures.forEach((f: any) => {
                        // Le backend renvoie le jour en français (lundi…)
                        // On cherche la clé anglaise correspondante pour WeekSchedulePicker
                        const jourFr = f.jour.toLowerCase()
                        const dayEn = Object.entries(DAY_EN_TO_FR).find(
                            ([, fr]) => fr === jourFr
                        )?.[0] as DayKey | undefined
 
                        if (!dayEn || !newWeek[dayEn]) return
 
                        const start = f.heure_debut.slice(0, 5)
                        const end   = f.heure_fin.slice(0, 5)
 
                        if (!newWeek[dayEn].morning.start) {
                            newWeek[dayEn].morning = { start, end }
                        } else {
                            newWeek[dayEn].afternoon = { start, end }
                        }
                    })
 
                    setWeek(newWeek)
                }
 
            } catch (err) {
                setError("Impossible de charger la laverie.")
            } finally {
                setLoading(false)
            }
        }
 
        if (id) fetchLaverie()
    }, [id])
 
    // ─── Validation ───────────────────────────────────────────────────────────
 
    const validate = (): boolean => {
        const e: Record<string, string> = {}
        if (!name)       e.name       = "Le nom est requis"
        if (!adresse)    e.adresse    = "L'adresse est requise"
        if (!rue)        e.rue        = "La rue est requise"
        if (!codePostal) e.codePostal = "Le code postal est requis"
        if (!city)       e.city       = "La ville est requise"
        if (!country)    e.country    = "Le pays est requis"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ─── Soumission ───────────────────────────────────────────────────────────
 
    // ─── Chargement des données ───────────────────────────────────────────────
    useEffect(() => {
        const fetchLaverie = async () => {
            try {
                const response = await api.get(`/${id}`);
                const data = response.data;

                // Informations de base
                setName(data.nom_etablissement ?? "");
                setContactEmail(data.contact_email ?? "");
                setDescription(data.description ?? "");
                setWilineCode(String(data.wi_line_reference ?? ""));

                if (data.adresse) {
                    setAdresse(data.adresse.adresse ?? "");
                    setRue(data.adresse.rue ?? "");
                    setCodePostal(String(data.adresse.code_postal ?? ""));
                    setCity(data.adresse.ville ?? "");
                    setCountry(data.adresse.pays ?? "");
                    setLatitude(String(data.adresse.latitude ?? ""));
                    setLongitude(String(data.adresse.longitude ?? ""));
                }

                setSelectedServices(data.services?.map((s: any) => String(s.id)) ?? []);
                setSelectedPayments(data.methodePaiements?.map((p: any) => String(p.id)) ?? []);

                // ✅ FIX : Mapping des équipements (Machines)
                // On vérifie les deux noms de clés possibles (laverieEquipements ou equipements)
                const rawEq = data.laverieEquipements || data.equipements || [];
                const normalizedEq: EquipementFormData[] = rawEq.map((eq: any) => {
                    // Extraction de la valeur de l'Enum (si objet ou string)
                    const typeBrut = typeof eq.type === "object" ? eq.type.value : eq.type;
                    return {
                        nom: eq.nom ?? "Équipement",
                        type: (typeBrut?.toLowerCase() || "machine_a_laver") as any,
                        capacite: eq.capacite ? Number(eq.capacite) : null,
                        tarif: eq.tarif ? Number(eq.tarif) : null,
                        duree: eq.duree ? Number(eq.duree) : null,
                    };
                });
                setSelectedMachines(normalizedEq);

                // ✅ FIX : Mapping des horaires
                const rawHours = data.laverieFermetures || data.fermetures || [];
                const newWeek = JSON.parse(JSON.stringify(DEFAULT_WEEK_SCHEDULE));

                rawHours.forEach((f: any) => {
                    const jourFr = f.jour?.toLowerCase();
                    const dayEn = Object.entries(DAY_EN_TO_FR).find(
                        ([, fr]) => fr === jourFr
                    )?.[0] as DayKey | undefined;

                    if (dayEn && newWeek[dayEn]) {
                        // On récupère HH:mm
                        const start = f.heure_debut?.slice(0, 5);
                        const end = f.heure_fin?.slice(0, 5);

                        // On remplit le matin en priorité, puis l'après-midi
                        if (!newWeek[dayEn].morning.start) {
                            newWeek[dayEn].morning = { start, end };
                        } else {
                            newWeek[dayEn].afternoon = { start, end };
                        }
                    }
                });
                setWeek(newWeek);

            } catch (err) {
                console.error("Erreur fetch:", err);
                setError("Impossible de charger la laverie.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchLaverie();
    }, [id]);

    // ─── Soumission du formulaire ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        setError('');

        try {
            // Conversion des fichiers en Base64
            let logoBase64 = logo instanceof File ? await fileToBase64(logo) : null;
            let imagesBase64 = images ? await Promise.all(Array.from(images).map(fileToBase64)) : [];

            // ✅ FIX horaires : On envoie les jours en français pour correspondre au JourEnum PHP
            const weekScheduleFr: Record<string, any> = {};
            for (const [dayEn, schedule] of Object.entries(week)) {
                const dayFr = DAY_EN_TO_FR[dayEn];
                if (dayFr) weekScheduleFr[dayFr] = schedule;
            }

            const payload = {
                nom_etablissement: name,
                description,
                contact_email: contactEmail,
                adresse,
                rue,
                code_postal: codePostal,
                ville: city,
                pays: country,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                services: selectedServices.map(Number),
                methodes_paiement: selectedPayments.map(Number),
                // On envoie le tableau d'objets tel quel, le contrôleur s'occupe du reste
                equipements: selectedMachines,
                weekSchedule: weekScheduleFr,
                logo: logoBase64,
                images: imagesBase64,
            };

            await api.put(`/edit/${id}`, payload);

            setSuccessMessage('Laverie mise à jour avec succès !');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            console.error('Erreur submit:', err);
            const msg = err?.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };
 

        // ─── Rendu ────────────────────────────────────────────────────────────────
 
    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 max-w-md mx-auto mt-10">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }
 
    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center p-4 max-w-md mx-auto">
            <h1 className="font-semibold mt-10 text-2xl text-gray-900 text-center">
                Modifier la laverie
            </h1>
            <p className="text-gray-500 text-center mb-6">
                Mettez à jour les informations de votre établissement
            </p>
 
            {/* Logo */}
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="logo">
                    Logo <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="logo" type="file" onChange={e => setLogo(e.target.files?.[0] ?? null)} />
                <FieldDescription>Sélectionnez un logo.</FieldDescription>
            </Field>
 
            {/* Galerie d'images */}
            <div className="my-5 w-full">
                <h2 className="font-semibold text-lg text-center">Galerie d'images</h2>
                <p className="text-gray-500 text-center mb-3">
                    Vous pouvez ajouter plusieurs images de votre laverie
                </p>
                <CarouselWithThumbs />
            </div>
 
            {/* Upload images */}
            <Field className="w-full">
                <FieldLabel htmlFor="imagesLaundry">Images de la laverie</FieldLabel>
                <Input id="imagesLaundry" type="file" multiple onChange={e => setImages(e.target.files)} />
                <FieldDescription>Sélectionnez des images pour votre laverie.</FieldDescription>
            </Field>
 
            {successMessage && (
                <div role="status" aria-live="polite" className="w-full p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-sm mb-4">
                    {successMessage}
                </div>
            )}
 
            {error && (
                <div role="alert" className="w-full p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4">
                    {error}
                </div>
            )}
 
            {/* Nom */}
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="name">
                    Nom de la laverie <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="h-11" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </Field>
 
            {/* Email de contact */}
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="contactEmail">Email de contact</FieldLabel>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="h-11" />
            </Field>
 
            {/* Adresse */}
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="adresse">
                    Numéro <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="adresse" type="text" value={adresse} onChange={e => setAdresse(e.target.value)} className="h-11" />
                {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
            </Field>
 
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="rue">
                    Rue <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="rue" type="text" value={rue} onChange={e => setRue(e.target.value)} className="h-11" />
                {errors.rue && <p className="text-red-500 text-xs mt-1">{errors.rue}</p>}
            </Field>
 
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="codePostal">
                    Code postal <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="codePostal" type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} className="h-11" />
                {errors.codePostal && <p className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
            </Field>
 
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="city">
                    Ville <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} className="h-11" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </Field>
 
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="country">
                    Pays <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input id="country" type="text" value={country} onChange={e => setCountry(e.target.value)} className="h-11" />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
            </Field>
 
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <Field>
                    <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                    <Input id="latitude" type="number" value={latitude} onChange={e => setLatitude(e.target.value)} className="h-11" />
                </Field>
                <Field>
                    <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                    <Input id="longitude" type="number" value={longitude} onChange={e => setLongitude(e.target.value)} className="h-11" />
                </Field>
            </div>
 
            {/* Description */}
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldDescription>Décrivez votre laverie en quelques mots.</FieldDescription>
                <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="h-32"
                    placeholder="Écrivez une description pour votre laverie."
                />
            </Field>
 
            {/* Wi-Line */}
            <Field className="w-full mt-4">
                <FieldLabel htmlFor="wilineCode">Code Wi-Line</FieldLabel>
                <FieldDescription>Fourni si votre laverie dispose d'une centrale de paiement Wi-Line.</FieldDescription>
                <Input id="wilineCode" type="text" value={wilineCode} onChange={e => setWilineCode(e.target.value)} className="h-11" />
            </Field>
 
            {/* ✅ Machines : affichage depuis selectedMachines (BDD) + ajout via modal */}
            <div className="my-5 w-full">
                <h2 className="font-semibold text-lg text-center mb-2">Machines & équipements</h2>
 
                {selectedMachines.length === 0 && (
                    <p className="text-gray-400 text-sm text-center mb-3">Aucun équipement ajouté.</p>
                )}
 
                {/* ✅ Cards depuis selectedMachines (données réelles) */}
                {selectedMachines.map((machine, index) => (
                    <div key={index} className="relative">
                        <CardMachine
                            name={machine.nom}
                            capacity={machine.capacite ?? 0}
                            duration={machine.duree ?? 0}
                            price={machine.tarif ?? 0}
                            available={true}
                        />
                        {/* Bouton suppression */}
                        <button
                            type="button"
                            onClick={() => handleRemoveMachine(index)}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 text-xs font-bold transition"
                            aria-label="Supprimer cet équipement"
                        >
                            ✕
                        </button>
                    </div>
                ))}
 
                {/* ✅ FIX : onAdd={handleAddMachine} pour brancher la modal */}
                <MachineModal onAdd={handleAddMachine} />
            </div>

            {/* Horaires */}
            <div className="w-full mt-6">
                <WeekSchedulePicker value={week} onChange={setWeek} />
            </div>
 
            {/* Services */}
            <div className="w-full mt-4">
                <CheckboxGroup
                    title="Services disponibles"
                    options={allServices.map(s => ({ value: String(s.id), label: s.nom }))}
                    value={selectedServices}
                    onChange={setSelectedServices}
                />
            </div>
 
            {/* Paiements */}
            <div className="w-full mt-4">
                <CheckboxGroup
                    title="Moyens de paiement"
                    options={allPaiements.map(p => ({ value: String(p.id), label: p.nom }))}
                    value={selectedPayments}
                    onChange={setSelectedPayments}
                />
            </div>
 
            <div className="w-full mt-10 mb-12">
                <Button type="submit" className="w-full h-12" disabled={saving}>
                    {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </Button>
            </div>
        </form>
    )
}
 