
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import { CheckboxGroup } from '@/components/ui/checkboxGroupEdit'
import WeekSchedulePicker, { type WeekSchedule, DEFAULT_WEEK_SCHEDULE, type DayKey } from '@/components/ui/timePicker'
import axios from 'axios'
import CarouselFromUrls from '@/components/ui/carouselImageEdit'
import CarouselFromFiles from '@/components/ui/carouselImage'
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

// WeekSchedulePicker et JourEnum Symfony utilisent tous les deux les clés françaises
// (lundi, mardi…) — aucun mapping de jours nécessaire

// ─── Composant ────────────────────────────────────────────────────────────────

export default function FormEditLaverie() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [loading, setLoading]               = useState(true)
    const [saving, setSaving]                 = useState(false)
    const [error, setError]                   = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState("")
    const [wilineLoading, setWilineLoading]   = useState(false)
    const [wilineError, setWilineError]       = useState<string | null>(null)
    const [geoErreur, setGeoErreur]           = useState<string | null>(null)

    const [name, setName]                     = useState("")
    const [contactEmail, setContactEmail]     = useState("")
    const [description, setDescription]       = useState("")
    const [wilineCode, setWilineCode]         = useState("")
    const [adresse, setAdresse]               = useState("")
    const [codePostal, setCodePostal]         = useState("")
    const [city, setCity]                     = useState("")
    const [country, setCountry]               = useState("")
    const [selectedServices, setSelectedServices]   = useState<string[]>([])
    const [selectedPayments, setSelectedPayments]   = useState<string[]>([])
    const [week, setWeek]                     = useState<WeekSchedule>(DEFAULT_WEEK_SCHEDULE)
    const [logo, setLogo]                     = useState<File | null>(null)
    const [logoPreview, setLogoPreview]       = useState<string | null>(null)
    const logoInputRef                        = useRef<HTMLInputElement>(null)
    const logoUrlRef                          = useRef<string | null>(null)
    const fieldsRef = useRef<Record<string,HTMLDivElement | null>>({})
    const [images, setImages]                 = useState<FileList | null>(null)
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)

    const [selectedMachines, setSelectedMachines] = useState<EquipementFormData[]>([])

    const [allServices, setAllServices]   = useState<{ id: number; nom: string }[]>([])
    const [allPaiements, setAllPaiements] = useState<{ id: number; nom: string }[]>([])
    const [errors, setErrors]             = useState<Record<string, string>>({})

    // ─── Utilitaires ─────────────────────────────────────────────────────────

    const emptyDay = () => ({
        morning:   { start: "", end: "" },
        afternoon: { start: "", end: "" },
    })

    function parseCapacite(typeName: string): number | null {
        const match = typeName?.match(/(\d+)\s*kg/i)
        return match ? parseInt(match[1]) : null
    }

    function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload  = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // ─── Handlers machines ────────────────────────────────────────────────────

    const handleAddMachine = (data: EquipementFormData) => {
        setSelectedMachines(prev => [...prev, data])
    }

    const handleRemoveMachine = (index: number) => {
        setSelectedMachines(prev => prev.filter((_, i) => i !== index))
    }

    // ─── Import Wi-Line ───────────────────────────────────────────────────────

    const handleWilineImport = async () => {
        if (!wilineCode.trim()) return
        setWilineLoading(true)
        setWilineError(null)
        try {
            const res = await api.get(`/wiline-data?serial=${encodeURIComponent(wilineCode.trim())}`)
            const d = res.data

            if (d.name)        setName(d.name)
            if (d.pub)         setDescription(d.pub)
            if (d.address)     setAdresse(d.address)
            if (d.postal_code) setCodePostal(String(d.postal_code))
            if (d.city)        setCity(d.city)
            if (d.country)     setCountry(d.country)

            // Machines (WASH → machine_a_laver, DRY → seche_linge, PRODUCTS → distributeur_de_lessive)
            const categoryMap: Record<string, EquipementFormData["type"]> = {
                WASH:     'machine_a_laver',
                DRY:      'seche_linge',
                PRODUCTS: 'distributeur_de_lessive',
            }
            if (Array.isArray(d.machines)) {
                const imported: EquipementFormData[] = d.machines
                    .filter((m: any) => categoryMap[m.category_text])
                    .map((m: any) => ({
                        nom:      m.type_name || 'Équipement',
                        type:     categoryMap[m.category_text],
                        capacite: parseCapacite(m.type_name),
                        tarif:    m.price    > 0 ? m.price / 100                : null,
                        duree:    m.duration > 0 ? Math.round(m.duration / 60)  : null,
                    }))
                setSelectedMachines(imported)
            }

            // Horaires (Wi-Line utilise des clés anglaises, dont "thuesday" avec une faute de frappe)
            const dayMap: Record<string, DayKey> = {
                monday:    'lundi',
                thuesday:  'mardi',
                wednesday: 'mercredi',
                thursday:  'jeudi',
                friday:    'vendredi',
                saturday:  'samedi',
                sunday:    'dimanche',
            }
            if (d.opening_hours) {
                const newWeek: WeekSchedule = {
                    lundi:    emptyDay(), mardi:    emptyDay(), mercredi: emptyDay(),
                    jeudi:    emptyDay(), vendredi: emptyDay(), samedi:   emptyDay(), dimanche: emptyDay(),
                }
                for (const [engDay, slots] of Object.entries(d.opening_hours)) {
                    const frDay = dayMap[engDay]
                    if (!frDay || !Array.isArray(slots) || slots.length === 0) continue
                    newWeek[frDay].morning = { start: (slots as any[])[0]?.open ?? '', end: (slots as any[])[0]?.close ?? '' }
                    if ((slots as any[]).length > 1) {
                        newWeek[frDay].afternoon = { start: (slots as any[])[1].open, end: (slots as any[])[1].close }
                    }
                }
                setWeek(newWeek)
            }

            const paymentNameMap: Record<string, string> = {
                coin_accepted:     'Pièces',
                bill_accepted:     'Billet',
                card_accepted:     'Carte Bleue',
                fidelity_accepted: 'Carte Fidélité',
            }
            const newPaymentIds: string[] = []
            for (const [key, label] of Object.entries(paymentNameMap)) {
                if (d[key] === true) {
                    const found = allPaiements.find(p => p.nom === label)
                    if (found) newPaymentIds.push(String(found.id))
                }
            }
            if (newPaymentIds.length > 0) {
                setSelectedPayments(prev => [...new Set([...prev, ...newPaymentIds])])
            }

        } catch (err: any) {
            setWilineError(err?.response?.data?.message || t('laundry_form_wiline_fetch_error'))
        } finally {
            setWilineLoading(false)
        }
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
                const response = await api.get(`/${id}`)
                const data = response.data

                setName(data.nom_etablissement ?? "")
                setContactEmail(data.contact_email ?? "")
                setDescription(data.description ?? "")
                setWilineCode(String(data.wi_line_reference ?? ""))

                if (data.adresse) {
                    setAdresse(data.adresse.adresse ?? "")
                    setCodePostal(String(data.adresse.code_postal ?? ""))
                    setCity(data.adresse.ville ?? "")
                    setCountry(data.adresse.pays ?? "")
                }

                setSelectedServices(data.services?.map((s: any) => String(s.id)) ?? [])
                setSelectedPayments(data.methodePaiements?.map((p: any) => String(p.id)) ?? [])

                // Logo actuel
                if (data.logo?.emplacement) {
                    setExistingLogoUrl(`${API_BASE}${data.logo.emplacement}`)
                }

                // Images existantes depuis laverieMedias
                if (data.laverieMedias?.length) {
                    setExistingImages(
                        data.laverieMedias.map((m: any) => `${API_BASE}${m.emplacement}`)
                    )
                }

                // Machines : le backend renvoie la clé "equipements"
                const rawEq: any[] = data.equipements || []
                const normalizedEq: EquipementFormData[] = rawEq.map((eq: any) => {
                    const typeBrut = typeof eq.type === "object" ? eq.type.value : eq.type
                    return {
                        nom:      eq.nom ?? "Équipement",
                        type:     (typeBrut?.toLowerCase() || "machine_a_laver") as EquipementFormData["type"],
                        capacite: eq.capacite != null ? Number(eq.capacite) : null,
                        tarif:    eq.tarif    != null ? Number(eq.tarif)    : null,
                        duree:    eq.duree    != null ? Number(eq.duree)    : null,
                    }
                })
                setSelectedMachines(normalizedEq)

                // Horaires : backend et WeekSchedulePicker utilisent tous les deux les clés françaises
                const newWeek: WeekSchedule = {
                    lundi:    emptyDay(),
                    mardi:    emptyDay(),
                    mercredi: emptyDay(),
                    jeudi:    emptyDay(),
                    vendredi: emptyDay(),
                    samedi:   emptyDay(),
                    dimanche: emptyDay(),
                }

                const rawHours: any[] = data.laverieFermetures || []
                rawHours.forEach((f: any) => {
                    const jourFr = f.jour?.toLowerCase() as DayKey
                    if (!jourFr || !newWeek[jourFr]) return

                    const start = f.heure_debut?.slice(0, 5)
                    const end   = f.heure_fin?.slice(0, 5)

                    // Premier créneau du jour → matin, second → après-midi
                    if (!newWeek[jourFr].morning.start) {
                        newWeek[jourFr].morning = { start, end }
                    } else {
                        newWeek[jourFr].afternoon = { start, end }
                    }
                })
                setWeek(newWeek)

            } catch (err) {
                console.error("Erreur fetch:", err)
                setError(t('edit_laundry_load_error'))
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchLaverie()
    }, [id])

    // ─── Validation ───────────────────────────────────────────────────────────

    const validate = (): Record<string, string> => {
        const e: Record<string, string> = {}
        if (!name)       e.name       = t('validation_name_required')
        if (!adresse)    e.adresse    = t('validation_address_required')
        if (!codePostal) e.codePostal = t('validation_postal_required')
        if (!city)       e.city       = t('validation_city_required')
        if (!country)    e.country    = t('validation_country_required')
        setErrors(e)
        return e
    }

    // ─── Soumission du formulaire ─────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors = validate()
        const fieldScrollOrder = [
            {key:'name',       refKey: 'name'   },
            {key:'adresse',    refKey: 'adresse' },
            {key:'codePostal', refKey: 'adresse' },
            {key:'city',       refKey: 'adresse' },
            {key:'country',    refKey: 'adresse' },
        ]
        const firstError = fieldScrollOrder.find(({key}) => newErrors[key])
        if (firstError) {
            fieldsRef.current[firstError.refKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }
        setGeoErreur("")
        setSaving(true)
        setError(null)

        try {
            const logoBase64   = logo   instanceof File ? await fileToBase64(logo)                               : undefined
            const imagesBase64 = images                 ? await Promise.all(Array.from(images).map(fileToBase64)) : undefined

            const payload: Record<string, any> = {
                nom_etablissement: name,
                description,
                contact_email:     contactEmail,
                wi_line_reference: wilineCode.trim() || null,
                adresse,
                code_postal:       codePostal,
                ville:             city,
                pays:              country,
                services:          selectedServices.map(Number),
                methodes_paiement: selectedPayments.map(Number),
                equipements:       selectedMachines,
                weekSchedule:      week,
            }

            if (logoBase64)   payload.logo   = logoBase64
            if (imagesBase64) payload.images = imagesBase64

            await api.put(`/edit/${id}`, payload)

            setSuccessMessage(t('edit_laundry_success'))
            navigate('/pro/dashboard')
        } catch (err: any) {
            if (err?.response?.data?.errors?.geolocation) {
                setGeoErreur(err.response.data.errors.geolocation)
                fieldsRef.current['adresse']?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            setError(err?.response?.data?.message || t('edit_laundry_update_error'))
        } finally {
            setSaving(false)
        }
    }

    // Cleanup uniquement au démontage — évite la révocation prématurée en React Strict Mode
    useEffect(() => {
        return () => { if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current) }
    }, [])

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

            {/* Bouton retour */}
            <div className="w-full mt-6">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    {t('edit_laundry_back')}
                </button>
            </div>

            <h1 className="font-semibold mt-4 text-2xl text-gray-900 text-center">
                {t('edit_laundry_title')}
            </h1>
            <p className="text-gray-500 text-center mb-6">
                {t('edit_laundry_subtitle')}
            </p>

            {/* Wi-Line */}
            <Field className="w-full max-w-md mx-auto mt-10">
                <FieldLabel htmlFor="wilineCode">{t('laundry_form_wiline_label')}</FieldLabel>
                <FieldDescription>
                    {t('laundry_form_wiline_description')}
                </FieldDescription>
                <div className="flex gap-2 mt-2 w-full">
                    <Input
                        id="wilineCode"
                        type="text"
                        value={wilineCode}
                        onChange={e => setWilineCode(e.target.value)}
                        className="h-11 flex-1"
                        placeholder={t('laundry_form_wiline_placeholder')}
                    />
                    <Button
                        type="button"
                        onClick={handleWilineImport}
                        disabled={!wilineCode.trim() || wilineLoading}
                        className="h-11 whitespace-nowrap px-4 py-2"
                    >
                        {wilineLoading ? t('laundry_form_wiline_loading') : t('laundry_form_wiline_import')}
                    </Button>
                </div>
                {wilineError && (
                    <p className="text-red-500 text-xs mt-1">{wilineError}</p>
                )}
            </Field>

            {/* Logo — prévisualisation comme dans le formulaire d'ajout */}
            {logoPreview && (
                <div className="mt-3 flex flex-col items-center gap-2">
                    <img
                        src={logoPreview}
                        alt={t('laundry_form_logo_label')}
                        className="w-24 h-24 object-contain rounded-xl border border-gray-200 shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current)
                            logoUrlRef.current = null
                            setLogoPreview(null)
                            setLogo(null)
                            if (logoInputRef.current) logoInputRef.current.value = ""
                        }}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                        {t('edit_laundry_logo_cancel')}
                    </button>
                </div>
            )}
            {!logoPreview && existingLogoUrl && (
                <div className="mt-3 flex flex-col items-center gap-2">
                    <img src={existingLogoUrl} alt={t('laundry_form_logo_label')} className="w-24 h-24 object-contain rounded-xl border border-gray-200 shadow-sm" />
                    <button
                        type="button"
                        onClick={() => setExistingLogoUrl(null)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                        {t('edit_laundry_logo_delete_current')}
                    </button>
                </div>
            )}

            <Field className="w-full mt-4">
                <FieldLabel htmlFor="logo">
                    {t('laundry_form_logo_label')} <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input
                    id="logo"
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                        const file = e.target.files?.[0] ?? null
                        setLogo(file)
                        if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current)
                        const newUrl = file ? URL.createObjectURL(file) : null
                        logoUrlRef.current = newUrl
                        setLogoPreview(newUrl)
                    }}
                />
                <FieldDescription>
                    {existingLogoUrl ? t('edit_laundry_logo_replace') : t('edit_laundry_logo_select')}
                </FieldDescription>
            </Field>

            {/* Galerie d'images */}
            <div className="my-5 w-full">
                <h2 className="font-semibold text-lg text-center">{t('laundry_form_gallery_title')}</h2>
                <p className="text-gray-500 text-center mb-3">
                    {t('laundry_form_gallery_description')}
                </p>
                {images
                    ? <CarouselFromFiles files={images} />
                    : <CarouselFromUrls images={existingImages} />
                }
            </div>

            {/* Upload images */}
            <Field className="w-full">
                <FieldLabel htmlFor="imagesLaundry">{t('edit_laundry_images_label')}</FieldLabel>
                <Input id="imagesLaundry" type="file" accept="image/*" multiple onChange={e => setImages(e.target.files)} />
                <FieldDescription>{t('edit_laundry_images_replace')}</FieldDescription>
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
            <div ref={el => {fieldsRef.current.name = el}} className='w-full'>
                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="name">
                        {t('laundry_form_name_label')} <span className="text-orange-500">*</span>
                    </FieldLabel>
                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="h-11" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </Field>
            </div>

            {/* Email de contact */}
            <div ref={el => {fieldsRef.current.contactEmail = el}} className='w-full'>
                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="contactEmail">{t('laundry_form_email_label')}</FieldLabel>
                    <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="h-11" />
                </Field>
            </div>

            <div ref={el => {fieldsRef.current.adresse = el}} className='w-full'>
                {geoErreur && (
                    <p className="text-red-500 text-xs mt-1">{geoErreur}</p>
                )}

                {/* Adresse */}
                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="adresse">
                        {t('laundry_form_address_label')} <span className="text-orange-500">*</span>
                    </FieldLabel>
                    <Input id="adresse" type="text" value={adresse} onChange={e => setAdresse(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`} />
                    {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
                </Field>

                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="codePostal">
                        {t('laundry_form_postal_label')} <span className="text-orange-500">*</span>
                    </FieldLabel>
                    <Input id="codePostal" type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`}/>
                    {errors.codePostal && <p className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
                </Field>

                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="city">
                        {t('laundry_form_city_label')} <span className="text-orange-500">*</span>
                    </FieldLabel>
                    <Input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </Field>

                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="country">
                        {t('laundry_form_country_label')} <span className="text-orange-500">*</span>
                    </FieldLabel>
                    <Input id="country" type="text" value={country} onChange={e => setCountry(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`} />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </Field>
            </div>

            {/* Description */}
            <div ref={el => {fieldsRef.current.description = el}} className='w-full'>
                <Field className="w-full mt-4">
                    <FieldLabel htmlFor="description">{t('laundry_form_description_label')}</FieldLabel>
                    <FieldDescription>{t('edit_laundry_description_hint')}</FieldDescription>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="h-32"
                        placeholder={t('laundry_form_description_placeholder')}
                    />
                </Field>
            </div>

            {/* Machines */}
            <div className="my-5 w-full">
                <h2 className="font-semibold text-lg text-center mb-2">{t('edit_laundry_machines_title')}</h2>

                {selectedMachines.length === 0 && (
                    <p className="text-gray-400 text-sm text-center mb-3">{t('edit_laundry_no_equipment')}</p>
                )}

                {selectedMachines.map((machine, index) => (
                    <div key={index} className="relative">
                        <CardMachine
                            name={machine.nom}
                            capacity={machine.capacite ?? 0}
                            duration={machine.duree ?? 0}
                            price={machine.tarif ?? 0}
                            available={true}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveMachine(index)}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 text-xs font-bold transition"
                            aria-label={t('edit_laundry_delete_machine')}
                        >
                            ✕
                        </button>
                    </div>
                ))}

                <MachineModal onAdd={handleAddMachine} />
            </div>

            {/* Services */}
            <div className="w-full mt-4">
                <CheckboxGroup
                    title={t('edit_laundry_services_title')}
                    options={allServices.map(s => ({ value: String(s.id), label: s.nom }))}
                    disabled={false}
                    value={selectedServices}
                    onChange={setSelectedServices}
                />
            </div>

            {/* Horaires */}
            <div className="w-full mt-6">
                <WeekSchedulePicker value={week} onChange={setWeek} />
            </div>

            {/* Paiements */}
            <div className="w-full mt-4">
                <CheckboxGroup
                    title={t('edit_laundry_payments_title')}
                    options={allPaiements.map(p => ({ value: String(p.id), label: p.nom }))}
                    disabled={false}
                    value={selectedPayments}
                    onChange={setSelectedPayments}
                />
            </div>

            <div className="w-full mt-10 mb-12">
                <Button type="submit" className="w-full h-12" disabled={saving}>
                    {saving ? t('edit_laundry_submitting') : t('edit_laundry_submit')}
                </Button>
            </div>
        </form>
    )
}
