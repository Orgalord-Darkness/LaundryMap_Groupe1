import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
    baseURL: `${API_BASE}/api/v1/professionnel`,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

interface ProDetail {
    id: number
    siren: number
    statut: string
    date_validation: string | null
    utilisateur: { id: number; nom: string; prenom: string; email: string }
    adresse: {
        adresse: string
        rue: string
        code_postal: number
        ville: string
        pays: string
    } | null
}

export default function FormProfessionnelValidation() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [pro, setPro] = useState<ProDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [motif, setMotif] = useState('')
    const [motifError, setMotifError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        if (!id) return
        api.get(`/admin/${id}`)
            .then(res => setPro(res.data))
            .catch(() => setError('Impossible de charger les données du professionnel.'))
            .finally(() => setLoading(false))
    }, [id])

    const handleAction = async (action: 'VALIDE' | 'REFUSE') => {
        if (action === 'REFUSE' && !motif.trim()) {
            setMotifError('Le motif est obligatoire pour un refus.')
            return
        }
        setMotifError('')
        setSubmitting(true)
        setFeedback(null)

        try {
            await api.post(`/admin/valider/${id}`, {
                action,
                motif: motif.trim() || 'Décision prise par un administrateur.',
            })

            setFeedback({
                type: 'success',
                message: action === 'VALIDE'
                    ? 'Compte professionnel validé avec succès.'
                    : 'Compte professionnel refusé.',
            })

            setTimeout(() => navigate('/admin/professionnal/validation'), 1500)
        } catch {
            setFeedback({ type: 'error', message: 'Une erreur est survenue lors de l\'action.' })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Chargement...</div>
    if (error || !pro) return <div className="p-10 text-red-500 text-center">{error}</div>

    const statutLabel: Record<string, string> = {
        'en attente': 'En attente',
        'validé':     'Validé',
        'refusé':     'Refusé',
        'banni':      'Banni',
    }

    return (
        <form className="flex flex-col items-center p-4 max-w-md mx-auto">

            <h1 className="font-semibold mt-10 text-2xl text-gray-900 text-center">
                Demande de compte professionnel
            </h1>
            <p className="text-gray-500 text-center mb-6">
                Consultez les informations avant de prendre une décision
            </p>

            {/* Feedback */}
            {feedback && (
                <div className={`w-full p-4 rounded-xl text-sm mb-4 border ${
                    feedback.type === 'success'
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                    {feedback.message}
                </div>
            )}

            {/* Statut actuel */}
            <div className="w-full mb-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">Statut actuel :</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    pro.statut === 'en attente'
                        ? 'bg-orange-100 text-orange-600'
                        : pro.statut === 'validé'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                }`}>
                    {statutLabel[pro.statut] ?? pro.statut}
                </span>
            </div>

            {/* Identité */}
            <Field className="w-full mt-4">
                <FieldLabel>Prénom</FieldLabel>
                <Input value={pro.utilisateur.prenom} disabled className="h-11 bg-gray-100" />
            </Field>

            <Field className="w-full mt-4">
                <FieldLabel>Nom</FieldLabel>
                <Input value={pro.utilisateur.nom} disabled className="h-11 bg-gray-100" />
            </Field>

            <Field className="w-full mt-4">
                <FieldLabel>Email</FieldLabel>
                <Input value={pro.utilisateur.email} disabled className="h-11 bg-gray-100" />
            </Field>

            <Field className="w-full mt-4">
                <FieldLabel>Numéro SIREN</FieldLabel>
                <Input value={String(pro.siren)} disabled className="h-11 bg-gray-100" />
            </Field>

            {/* Adresse */}
            {pro.adresse && (
                <>
                    <Field className="w-full mt-4">
                        <FieldLabel>Numéro</FieldLabel>
                        <Input value={pro.adresse.adresse} disabled className="h-11 bg-gray-100" />
                    </Field>

                    <Field className="w-full mt-4">
                        <FieldLabel>Rue</FieldLabel>
                        <Input value={pro.adresse.rue} disabled className="h-11 bg-gray-100" />
                    </Field>

                    <div className="w-full grid grid-cols-2 gap-3 mt-4">
                        <Field>
                            <FieldLabel>Code postal</FieldLabel>
                            <Input value={String(pro.adresse.code_postal)} disabled className="h-11 bg-gray-100" />
                        </Field>
                        <Field>
                            <FieldLabel>Ville</FieldLabel>
                            <Input value={pro.adresse.ville} disabled className="h-11 bg-gray-100" />
                        </Field>
                    </div>

                    <Field className="w-full mt-4">
                        <FieldLabel>Pays</FieldLabel>
                        <Input value={pro.adresse.pays} disabled className="h-11 bg-gray-100" />
                    </Field>
                </>
            )}

            {/* Motif */}
            <Field className="w-full mt-8">
                <FieldLabel>Motif de la décision</FieldLabel>
                <Textarea
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Expliquez votre décision…"
                    className={`h-28 ${motifError ? 'border-red-500' : ''}`}
                />
                {motifError && <p className="text-red-500 text-xs mt-1">{motifError}</p>}
            </Field>

            {/* Boutons */}
            <div className="flex gap-3 mt-8 mb-12">
                <Button
                    type="button"
                    className="h-10 px-6 bg-red-500 hover:bg-red-600 text-sm"
                    onClick={() => handleAction('REFUSE')}
                    disabled={submitting}
                >
                    Refuser
                </Button>

                <Button
                    type="button"
                    className="h-10 px-6 bg-green-600 hover:bg-green-700 text-sm"
                    onClick={() => handleAction('VALIDE')}
                    disabled={submitting}
                >
                    Valider
                </Button>
            </div>
        </form>
    )
}
