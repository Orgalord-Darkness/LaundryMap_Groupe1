import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import { CheckboxGroup } from '@/components/ui/checkboxGroup'
import WeekSchedulePicker, { type WeekSchedule, DEFAULT_WEEK_SCHEDULE } from '@/components/ui/timePicker'
import { api } from '../admin/laveries/list'

const API_BASE = import.meta.env.VITE_API_BASE_URL

// ─── Types ────────────────────────────────────────────────────────────────────

interface LaverieDetail {
    id: number
    nom_etablissement: string
    description: string | null
    contact_email: string | null
    wi_line_reference: number | null
    adresse: {
        adresse: string
        rue: string
        code_postal: number
        ville: string
        pays: string
        latitude: number | null
        longitude: number | null
    } | null
    services: { id: number; nom: string }[]
    methodePaiements: { id: number; nom: string }[]
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function FormEditLaverie() {
    const { id } = useParams<{ id: string }>()

    const [loading, setLoading]       = useState(true)
    const [saving, setSaving]         = useState(false)
    const [error, setError]           = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState("")

    // Champs du formulaire
    const [name, setName]             = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [description, setDescription] = useState("")
    const [wilineCode, setWilineCode] = useState("")
    const [adresse, setAdresse]       = useState("")
    const [rue, setRue]               = useState("")
    const [codePostal, setCodePostal] = useState("")
    const [city, setCity]             = useState("")
    const [country, setCountry]       = useState("")
    const [latitude, setLatitude]     = useState("")
    const [longitude, setLongitude]   = useState("")
    const [selectedServices, setSelectedServices]   = useState<string[]>([])
    const [selectedPayments, setSelectedPayments]   = useState<string[]>([])
    const [week, setWeek]             = useState<WeekSchedule>(DEFAULT_WEEK_SCHEDULE)

    const [errors, setErrors] = useState<Record<string, string>>({})

    // ─── Chargement initial ───────────────────────────────────────────────────

    useEffect(() => {
        if (!id) return;

        async function loadLaverie() {
            try {
                // On utilise l'instance 'api' (Axios) qui a déjà l'intercepteur
                const res = await api.get(`/laverie/${id}`);
                
                // On gère l'imbrication possible du Nelmio/Symfony
                const data = res.data.laverie ?? res.data;

                if (data) {
                    setName(data.nom_etablissement ?? "");
                    setContactEmail(data.contact_email ?? "");
                    setDescription(data.description ?? "");
                    setWilineCode(data.wi_line_reference?.toString() ?? "");
                    
                    // On vérifie l'existence de l'objet adresse
                    if (data.adresse) {
                        setAdresse(data.adresse.adresse ?? "");
                        setRue(data.adresse.rue ?? "");
                        setCodePostal(data.adresse.code_postal?.toString() ?? "");
                        setCity(data.adresse.ville ?? "");
                        setCountry(data.adresse.pays ?? "");
                        setLatitude(data.adresse.latitude?.toString() ?? "");
                        setLongitude(data.adresse.longitude?.toString() ?? "");
                    }

                    // Update des IDs pour les checkboxes
                    setSelectedServices(data.services?.map((s: any) => String(s.id)) ?? []);
                    setSelectedPayments(data.methodePaiements?.map((p: any) => String(p.id)) ?? []);
                }
            } catch (err) {
                console.error("Erreur de chargement:", err);
                setError("Impossible de charger la laverie. Vérifiez votre connexion.");
            } finally {
                setLoading(false);
            }
        }

        loadLaverie();
    }, [id]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)
        setError(null)

        const token = localStorage.getItem("token")

        try {
            const res = await fetch(`${API_BASE}/api/v1/laverie/edit/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nom_etablissement: name,
                    contact_email:     contactEmail,
                    description,
                    wi_line_reference: wilineCode ? Number(wilineCode) : null,
                    adresse,
                    rue,
                    code_postal:  Number(codePostal),
                    ville:        city,
                    pays:         country,
                    latitude:     latitude  ? Number(latitude)  : null,
                    longitude:    longitude ? Number(longitude) : null,
                    services:          selectedServices.map(Number),
                    methodes_paiement: selectedPayments.map(Number),
                    weekSchedule: week,
                }),
            })

            if (!res.ok) throw new Error()
            setSuccessMessage("Laverie mise à jour avec succès !")
            setTimeout(() => setSuccessMessage(""), 5000)
        } catch {
            setError("Une erreur est survenue lors de la mise à jour.")
        } finally {
            setSaving(false)
        }
    }

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

    if (error) {
        return (
            <div role="alert" className="m-4 p-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
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

            {/* Horaires */}
            <div className="w-full mt-6">
                <WeekSchedulePicker value={week} onChange={setWeek} />
            </div>

            {/* Services */}
            <div className="w-full mt-4">
                <CheckboxGroup
                    title="Équipements disponibles"
                    options={[
                        { value: '1', label: 'Wi-Fi' },
                        { value: '2', label: 'Tables & chaises' },
                        { value: '3', label: 'Distributeur de savon' },
                        { value: '4', label: 'Fer à repasser' },
                    ]}
                    // selected={selectedServices}
                    // onChange={setSelectedServices}
                />
            </div>

            {/* Paiements */}
            <div className="w-full mt-4">
                <CheckboxGroup
                    title="Moyens de paiement acceptés"
                    options={[
                        { value: '1', label: 'Carte Bleu' },
                        { value: '2', label: 'Carte Fidélité' },
                        { value: '3', label: 'Pièces' },
                        { value: '4', label: 'Billets' },
                    ]}
                    // selected={selectedPayments}
                    // onChange={setSelectedPayments}
                />
            </div>

            <div className="w-full mt-10 mb-12">
                <Button type="submit" className="w-full h-12" disabled={saving}>
                    {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                </Button>
            </div>
        </form>
    )
}