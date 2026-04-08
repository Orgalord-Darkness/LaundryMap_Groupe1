import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from "@/components/ui/button"
import { Textarea } from '@/components/ui/textarea'
import { FieldLabel } from "@/components/ui/field"
import { Field} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CheckboxGroup } from '@/components/ui/checkboxGroup'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default function LaverieValidation() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [laverie, setLaverie] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [motif, setMotif] = useState("")
    const [motifError, setMotifError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

    const fetchLaverieData = async () => {
        try {
            const res = await api.get(`/laverie/${id}`)
            const data = res.data.laverie ?? res.data
            if (!data) throw new Error("Laverie introuvable.")
            setLaverie(data)
        } catch (err) {
            setError("Impossible de charger les données.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchLaverieData()
    }, [id])

    const handleAction = async (action: "VALIDE" | "REFUSE") => {
        if (action === "REFUSE" && !motif.trim()) {
            setMotifError("Le motif est obligatoire pour un refus.")
            return
        }

        setSubmitting(true)
        setFeedback(null)

        try {
            await api.post(`/laverie/admin/valider/${id}`, {
                action,
                motif: motif.trim() || (action === "VALIDE" ? "Validation effectuée" : undefined),
            })

            setFeedback({
                type: "success",
                message: action === "VALIDE" ? "Laverie validée." : "Laverie refusée.",
            })

            await fetchLaverieData()
        } catch (err) {
            setFeedback({ type: "error", message: "Une erreur est survenue lors de l'action." })
        } finally {
            setSubmitting(false)
            navigate('/admin/laveries/list')
        }
    }

    if (loading) return <div className="p-10 text-center">Chargement...</div>
    if (error || !laverie) return <div className="p-10 text-red-500">{error}</div>

    const imageUrl = laverie.logo ? `${API_BASE}/${laverie.logo.emplacement.replace(/^\//, '')}` : null

    return (
        <form className="flex flex-col items-center p-4 max-w-md mx-auto">

        {/* Titre */}
        <h1 className="font-semibold mt-10 text-2xl text-gray-900 text-center">
            Demande de laverie
        </h1>
        <p className="text-gray-500 text-center mb-6">
            Consultez les informations avant de prendre une décision
        </p>

        {/* Feedback */}
        {feedback && (
            <div
                className={`w-full p-4 rounded-xl text-sm mb-4 border ${
                    feedback.type === "success"
                        ? "bg-green-100 border-green-400 text-green-700"
                        : "bg-red-50 border-red-200 text-red-600"
                }`}
            >
                {feedback.message}
            </div>
        )}

        {/* IMAGE */}
        {imageUrl && (
            <div className="w-full h-40 rounded-xl overflow-hidden shadow mb-4">
                <img src={imageUrl} className="w-full h-full object-cover" />
            </div>
        )}

        {/* Nom */}
        <Field className="w-full mt-4">
            <FieldLabel>Nom de la laverie</FieldLabel>
            <Input value={laverie.nom_etablissement} disabled className="h-11 bg-gray-100" />
        </Field>

        {/* Email */}
        <Field className="w-full mt-4">
            <FieldLabel>Email de contact</FieldLabel>
            <Input value={laverie.contact_email ?? ""} disabled className="h-11 bg-gray-100" />
        </Field>

        {/* Adresse */}
        <Field className="w-full mt-4">
            <FieldLabel>Numéro</FieldLabel>
            <Input value={laverie.adresse?.adresse ?? ""} disabled className="h-11 bg-gray-100" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Adresse</FieldLabel>
            <Input value={laverie.adresse?.rue ?? ""} disabled className="h-11 bg-gray-100" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Code postal</FieldLabel>
            <Input value={laverie.adresse?.code_postal ?? ""} disabled className="h-11 bg-gray-100" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Ville</FieldLabel>
            <Input value={laverie.adresse?.ville ?? ""} disabled className="h-11 bg-gray-100" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Pays</FieldLabel>
            <Input value={laverie.adresse?.pays ?? ""} disabled className="h-11 bg-gray-100" />
        </Field>

        {/* Coordonnées */}
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <Field>
                <FieldLabel>Latitude</FieldLabel>
                <Input value={laverie.adresse?.latitude ?? ""} disabled className="h-11 bg-gray-100" />
            </Field>
            <Field>
                <FieldLabel>Longitude</FieldLabel>
                <Input value={laverie.adresse?.longitude ?? ""} disabled className="h-11 bg-gray-100" />
            </Field>
        </div>

        {/* Description */}
        <Field className="w-full mt-4">
            <FieldLabel>Description</FieldLabel>
            <Textarea
                value={laverie.description ?? ""}
                disabled
                className="h-32 bg-gray-100"
            />
        </Field>

        {/* Services */}
        <div className="w-full mt-4">
            <CheckboxGroup
                title="Équipements disponibles"
                options={laverie.services.map((s: { id: any; nom: any }) => ({ value: s.id, label: s.nom }))}
                // selected={laverie.services.map(s => String(s.id))}
                // disabled
            />
        </div>

        {/* Paiements */}
        <div className="w-full mt-4">
            <CheckboxGroup
                title="Moyens de paiement acceptés"
                options={laverie.methodePaiements.map((p: { id: any; nom: any }) => ({ value: p.id, label: p.nom }))}
                // selected={laverie.methodePaiements.map(p => String(p.id))}
                // disabled
            />
        </div>

        {/* Champ motif */}
        <Field className="w-full mt-8">
            <FieldLabel>Motif de la décision</FieldLabel>
            <Textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Expliquez votre décision…"
                className={`h-28 ${motifError ? "border-red-500" : ""}`}
            />
            {motifError && <p className="text-red-500 text-xs mt-1">{motifError}</p>}
        </Field>

        {/* Boutons */}
        <div className="flex gap-3 mt-8 mb-12">
            <Button
                type="button"
                className="h-10 px-6 bg-red-500 hover:bg-red-600 text-sm"
                onClick={() => handleAction("REFUSE")}
                disabled={submitting}
            >
                Refuser
            </Button>

            <Button
                type="button"
                className="h-10 px-6 bg-green-600 hover:bg-green-700 text-sm"
                onClick={() => handleAction("VALIDE")}
                disabled={submitting}
            >
                Valider
            </Button>
        </div>
    </form>

    )
}
