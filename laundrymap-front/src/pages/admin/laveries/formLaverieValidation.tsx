import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Textarea } from '@/components/ui/textarea'
import { FieldLabel } from "@/components/ui/field"
import { Field} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CheckboxGroup } from '@/components/ui/checkboxGroupEdit'
import type {Service} from '@/components/utils/type.ts'
import type {Paiement} from '@/components/utils/type.ts'
import apiClient from '@/lib/apiClient'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function LaverieValidation() {
    const { id } = useParams<{ id: string }>()

    const [laverie, setLaverie] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [motif, setMotif] = useState("")
    const [motifError, setMotifError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

    const navigate = useNavigate()

    const fetchLaverieData = async () => {
        try {
            const res = await apiClient.get(`/laverie/${id}`)
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
            await apiClient.post(`/laverie/admin/valider/${id}`, {
                action,
                motif: motif.trim() || (action === "VALIDE" ? "Validation effectuée" : undefined),
            })

            setFeedback({
                type: "success",
                message: action === "VALIDE" ? "Laverie validée." : "Laverie refusée.",
            })
            await fetchLaverieData()
            navigate('/admin/laveries/list')
        } catch (err) {
            setFeedback({ type: "error", message: "Une erreur est survenue lors de l'action." })
            navigate
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Chargement...</div>
    if (error || !laverie) return <div className="p-10 text-red-500 dark:text-red-400">{error}</div>

    const imageUrl = laverie.logo ? `${API_BASE}${laverie.logo.emplacement}` : null

    return (
        <form className="flex flex-col items-center p-4 max-w-md mx-auto">

        {/* Titre */}
        <h1 className="font-semibold mt-10 text-2xl text-foreground text-center">
            Demande de laverie
        </h1>
        <p className="text-muted-foreground text-center mb-6">
            Consultez les informations avant de prendre une décision
        </p>

        {/* Feedback */}
        {feedback && (
            <div
                className={`w-full p-4 rounded-xl text-sm mb-4 border ${
                    feedback.type === "success"
                        ? "bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-700 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
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
            <Input value={laverie.nom_etablissement} disabled className="h-11 bg-muted" />
        </Field>

        {/* Email */}
        <Field className="w-full mt-4">
            <FieldLabel>Email de contact</FieldLabel>
            <Input value={laverie.contact_email ?? ""} disabled className="h-11 bg-muted" />
        </Field>

        {/* Adresse */}
        <Field className="w-full mt-4">
            <FieldLabel>Numéro</FieldLabel>
            <Input value={laverie.adresse?.adresse ?? ""} disabled className="h-11 bg-muted" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Adresse</FieldLabel>
            <Input value={laverie.adresse?.rue ?? ""} disabled className="h-11 bg-muted" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Code postal</FieldLabel>
            <Input value={laverie.adresse?.code_postal ?? ""} disabled className="h-11 bg-muted" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Ville</FieldLabel>
            <Input value={laverie.adresse?.ville ?? ""} disabled className="h-11 bg-muted" />
        </Field>

        <Field className="w-full mt-4">
            <FieldLabel>Pays</FieldLabel>
            <Input value={laverie.adresse?.pays ?? ""} disabled className="h-11 bg-muted" />
        </Field>

        {/* Coordonnées */}
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <Field>
                <FieldLabel>Latitude</FieldLabel>
                <Input value={laverie.adresse?.latitude ?? ""} disabled className="h-11 bg-muted" />
            </Field>
            <Field>
                <FieldLabel>Longitude</FieldLabel>
                <Input value={laverie.adresse?.longitude ?? ""} disabled className="h-11 bg-muted" />
            </Field>
        </div>

        {/* Description */}
        <Field className="w-full mt-4">
            <FieldLabel>Description</FieldLabel>
            <Textarea
                value={laverie.description ?? ""}
                disabled
                className="h-32 bg-muted"
            />
        </Field>

        {/* Services */}
        <div className="w-full mt-4">
            { laverie.services.length > 0 && (
                <CheckboxGroup
                    title="Équipements disponibles"
                    options={laverie.services.map((s:Service) => ({
                        value: String(s.id),
                        label: s.nom
                    }))}
                    disabled={true}
                    value={laverie.services.map((s:Service) => String(s.id))}
                />
            )}
            {laverie.services.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucun équipement spécifié</p>
            )}
        </div>

        {/* Paiements */}
        <div className="w-full mt-4">
            { laverie.methodePaiements.length > 0 && (<CheckboxGroup
                title="Moyens de paiement acceptés"
                options={laverie.methodePaiements.map((p:Paiement) => ({
                    value: String(p.id),
                    label: p.nom
                }))}
                disabled={true}
                value={laverie.methodePaiements.map((p:Paiement) => String(p.id))}
            />)}
            {laverie.methodePaiements.length === 0 && (
                <p className="text-muted-foreground text-sm">Aucun moyen de paiement spécifié</p>
            )}
            
        </div>

        {/* Champ motif */}
        <Field className="w-full mt-8">
            <FieldLabel>Motif de la décision</FieldLabel>
            <Textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Expliquez votre décision…"
                className={`h-28 ${motifError ? "border-red-500 dark:border-red-700" : ""}`}
            />
            {motifError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{motifError}</p>}
        </Field>

        {/* Boutons */}
        <div className="flex gap-3 mt-8 mb-12">
            <Button
                type="button"
                className="h-10 px-6 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-sm"
                onClick={() => handleAction("REFUSE")}
                disabled={submitting}
            >
                Refuser
            </Button>

            <Button
                type="button"
                className="h-10 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-sm"
                onClick={() => handleAction("VALIDE")}
                disabled={submitting}
            >
                Valider
            </Button>
        </div>
    </form>

    )
}
