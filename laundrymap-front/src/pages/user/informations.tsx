import { useState, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Inputs = {
    prenom: string
    nom: string
    email: string
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

const url = "http://localhost:8080/api/v1/utilisateur/modification"
const urlInfo = "http://localhost:8080/api/v1/utilisateur/mes_informations"

export default function Inscription() {

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        setError,
    } = useForm<Inputs>()

    const [successMessage, setSuccessMessage] = useState("");
    
    const infos = async () => {
        try {
            const token = localStorage.getItem("token")
            const reponse = await fetch(urlInfo, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })
            const data = await reponse.json()
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

    const [data, setData] = useState<any>(null);
    useEffect(() => {
        if (!data) return

        if (data?.erreurs && typeof data.erreurs === "object") {
            Object.entries(data.erreurs).forEach(([champ, messages]) => {
                setError(champ as keyof Inputs, {
                    type: "server",
                    message: Array.isArray(messages)
                        ? (messages as string[]).join(" ")
                        : messages as string,
                })
            })
        }

        if (data?.message === "Informations mises à jour avec succès") {
            setSuccessMessage(data.message)
        }

    }, [data])

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("")
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            const token = localStorage.getItem("token")
            const reponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(donnees),
            })

            const text = await reponse.text()
            try {
                setData(JSON.parse(text)) 
            } catch (e) {
                throw new Error("Réponse invalide du serveur")
            }

        } catch (erreur) {
            console.error("Erreur lors de la modification :", erreur)
        }
    }
    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg"
        >
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                Mes informations
            </h2>
            <p className="text-gray-600 text-center">
                Modifier mes informations
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
                <label className="text-sm font-medium mb-1">Mot de passe</label>
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
                <label className="text-sm font-medium mb-1">Confirmation du mot de passe</label>
                <Input
                    type="password"
                    {...register("confirmation_mot_de_passe", { required: false })}
                />
                {errors.confirmation_mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.confirmation_mot_de_passe.message}</p>}
            </div>

            <Button type="submit" className="mt-4 w-full">
                Confirmation
            </Button>

            <p className="text-center text-sm text-gray-700 underline font-medium mt-2 cursor-pointer">
                S'inscrire en tant que professionnel ?
            </p>
        </form>
    )
}