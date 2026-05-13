import { useState, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { PersonalSpaceNavbar, TAB_ROUTES, type PersonalSpaceTab } from "@/components/ui/PersonalSpaceNavbar"
import axios from "axios"
import { useAuth } from "@/components/context/AuthContext"

type Inputs = {
    prenom: string
    nom: string
    email: string
    mot_de_passe_actuel: string
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/modification`
const urlInfo = `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/mes_informations`

export default function MonProfi() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleTabChange = (tab: PersonalSpaceTab) => {
        const route = TAB_ROUTES[tab]
        if (route) navigate(route)
    }

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        setError,
    } = useForm<Inputs>()

    const [successMessage, setSuccessMessage] = useState("")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    
    const infos = async () => {
        try {
            const reponse = await axios.get(urlInfo, { withCredentials: true })
            const data = await reponse.data

            setValue("nom", data.nom)
            setValue("prenom", data.prenom)
            setValue("email", data.email) 
        
        } catch (erreur) {
            console.error("Erreur lors de la récupération des informations :", erreur)
        }
    }

    useEffect(() => {
        infos()
    }, [])  



    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("")
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const handleSupprimerCompte = async () => {
        setDeleteLoading(true)
        setDeleteError("")
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/suppression`,
                { withCredentials: true }
            )
            setConfirmOpen(false)
            await logout()
            navigate("/user/login")
        } catch {
            setDeleteError(t("supprimer_compte_erreur", "La suppression a échoué. Veuillez réessayer."))
            setDeleteLoading(false)
        }
    }

    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            if ((donnees.mot_de_passe || "").trim()) {
                if (!(donnees.mot_de_passe_actuel || "").trim()) {
                    setError("mot_de_passe_actuel", {
                        type: "manual",
                        message: "Le mot de passe actuel est requis pour modifier le mot de passe.",
                    })
                    return
                }
            }

            // validation front sur les mots de passe pour éviter le 400 de confirmation
            if ((donnees.mot_de_passe || "").trim() || (donnees.confirmation_mot_de_passe || "").trim()) {
                if (donnees.mot_de_passe !== donnees.confirmation_mot_de_passe) {
                    setError("confirmation_mot_de_passe", {
                        type: "server",
                        message: "La confirmation du mot de passe ne correspond pas.",
                    })
                    return
                }
            }

            const payload: Partial<Inputs> = {
                email: donnees.email,
                prenom: donnees.prenom,
                nom: donnees.nom,
            }

            if ((donnees.mot_de_passe || "").trim()) {
                payload.mot_de_passe_actuel = donnees.mot_de_passe_actuel
                payload.mot_de_passe = donnees.mot_de_passe
                payload.confirmation_mot_de_passe = donnees.confirmation_mot_de_passe
            }

            const reponse = await axios.put(url, payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            })

            const data = reponse.data
            if (data.errors) {
                Object.keys(data.errors).forEach((champ) => {
                    setError(champ as keyof Inputs, {
                    type: "server",
                    message: data.errors[champ],
                    })
                })
                return 
            }
            if (data.message) {
                setSuccessMessage(data.message)
            }
            
        } catch (erreur) {
            console.error("Erreur lors de la modification :", erreur)

            if (axios.isAxiosError(erreur) && erreur.response) {
                const data = erreur.response.data
                console.log("data reponse back:", JSON.stringify(data))

                if (data && typeof data === "object") {
                    const erreurs = data.erreurs ?? data.errors ?? data
                    console.log("erreurs extraites:", JSON.stringify(erreurs))
                    Object.keys(erreurs).forEach((champ) => {
                        if (champ !== "message") {
                            setError(champ as keyof Inputs, {
                                type: "server",
                                message: Array.isArray(erreurs[champ])
                                    ? erreurs[champ].join(" ")
                                    : erreurs[champ],
                            })
                        }
                    })
                    return
                }
            }

            setError("nom", {
                type: "server",
                message: "Impossible de modifier vos informations. Réessayez plus tard.",
            })
        }
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white px-4 pt-6 pb-0">
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Espace personnel</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Mon profil</p>
                    </div>
                    <PersonalSpaceNavbar active="Profil" onChange={handleTabChange} />
                </div>
            </div>

            <main className="flex-1 px-4 py-5">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg"
                >
                    <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                        {t('mes_informations', 'Mes informations')}
                    </h2>
                    <p className="text-gray-600 text-center">
                        {t('modifier_mes_informations', 'Modifier mes informations')}
                    </p>

                    {successMessage && (
                        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Prénom</label>
                        <Input
                            type="text"
                            {...register("prenom", { required: false })}
                        />
                        {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Nom</label>
                        <Input
                            type="text"
                            {...register("nom", { required: false })}
                        />
                        {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            {...register("email", { required: false })}
                            disabled={true}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Mot de passe actuel</label>
                        <Input
                            type="password"
                            {...register("mot_de_passe_actuel", { required: false })}
                        />
                        {errors.mot_de_passe_actuel && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe_actuel.message}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Nouveau Mot de passe</label>
                        <p className="text-xs text-gray-500 mt-1">
                            Longueur minimal : 8 caractères<br />
                            Utiliser minimum 1 majuscule, 1 minuscule, 1 caractère spécial
                        </p>
                        <Input
                            type="password"
                            {...register("mot_de_passe", { required: false })}
                        />
                        {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1 whitespace-pre-wrap">{errors.mot_de_passe.message}<br /></p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Confirmation du nouveau mot de passe</label>
                        <Input
                            type="password"
                            {...register("confirmation_mot_de_passe", { required: false })}
                        />
                        {errors.confirmation_mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.confirmation_mot_de_passe.message}</p>}
                    </div>

                    <Button type="submit" className="mt-4 w-full">
                        Confirmation
                    </Button>

                    {/* <p className="text-center text-sm text-gray-700 underline font-medium mt-2 cursor-pointer">
                        S'inscrire en tant que professionnel ?
                    </p> */}
                </form>
                <section
                    aria-labelledby="zone-danger-titre"
                    className="w-full max-w-md mx-auto mt-4 p-6 bg-white rounded-2xl shadow-lg border border-red-100"
                >
                    <h3
                        id="zone-danger-titre"
                        className="text-base font-semibold text-red-600 mb-1 text-center"
                    >
                        {t("zone_danger", "Zone de danger")}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        {t("supprimer_compte_description", "La suppression de votre compte est définitive. Vos avis et favoris seront conservés.")}
                    </p>
                    <Button
                        variant="danger"
                        className="w-full"
                        onClick={() => setConfirmOpen(true)}
                        aria-haspopup="dialog"
                    >
                        {t("supprimer_compte", "Supprimer mon compte")}
                    </Button>
                </section>

                <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DrawerContent>
                        <DrawerHeader className="text-center">
                            <DrawerTitle>
                                {t("supprimer_compte_titre_modal", "Supprimer mon compte")}
                            </DrawerTitle>
                            <DrawerDescription>
                                {t("supprimer_compte_confirmation_texte", "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")}
                            </DrawerDescription>
                        </DrawerHeader>

                        {deleteError && (
                            <p role="alert" className="px-4 text-red-500 text-sm text-center">
                                {deleteError}
                            </p>
                        )}

                        <DrawerFooter>
                            <Button
                                variant="danger"
                                onClick={handleSupprimerCompte}
                                disabled={deleteLoading}
                                aria-busy={deleteLoading}
                                className="w-full"
                            >
                                {deleteLoading
                                    ? t("supprimer_compte_en_cours", "Suppression...")
                                    : t("supprimer_compte_confirmer", "Confirmer la suppression")}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmOpen(false)}
                                disabled={deleteLoading}
                                className="w-full"
                            >
                                {t("annuler", "Annuler")}
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </main>
        </div>
    )
}