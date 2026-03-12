import { useState } from "react"
import {useForm, type SubmitHandler} from "react-hook-form"

type Inputs = {
    prenom: string
    nom: string
    email: string
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

const url = "http://localhost:8080/api/v1/utilisateur/inscription"

export default function Inscription() {
    const [successMessage, setSuccessMessage] = useState(""); 
    const {
        register, 
        handleSubmit, 
        formState: { errors },
        setError, 
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = async (donnees) =>
    {
        try {
            const reponse = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(donnees),
            })

            const text = await reponse.text(); 
            let data
            try {
                data = JSON.parse(text)
            } catch (e) {
                console.error("Réponse non-JSON:", text)
                throw new Error("Réponse invalide du serveur")
            }

            if (!reponse.ok) {
                if (data && typeof data === 'object') {
                    Object.keys(data).forEach((champ) => {
                        setError(champ as keyof Inputs, {
                            type: "server",
                            message: data[champ]
                        })
                    })
                }
                return
            }

            setSuccessMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.")
            // setTimeout(() => {
            //     window.location.href = '/login'
            // },2000)

        } catch (erreur) {
            console.error("Erreur lors de l'inscription :", erreur)
        }
    }

    return (
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg"
        >
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Inscription
        </h2>
        <p className="text-gray-600 text-center">
            Créer un compte utilisateur
        </p>

        {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                {successMessage}
            </div>
        )}


        <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Prénom <strong className="text-orange-500">*</strong></label>
            <input
            type="text"
            {...register("prenom", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="John"
            />
            {errors.prenom && <p className="text-red-500 text-xs">{errors.prenom.message}</p>}
        </div>

        <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Nom <strong className="text-orange-500">*</strong></label>
            <input
            type="text"
            {...register("nom", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="Doe"
            />
            {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p> }
        </div>

        <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Email <strong className="text-orange-500">*</strong></label>
            <input
            type="email"
            {...register("email", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="john.doe@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs whitespace-pre-wrap">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Mot de passe <strong className="text-orange-500">*</strong></label>
            <p className="text-xs text-gray-500 mt-1">
                Longueur minimal : 8 caractères<br></br>
                Utiliser minimum 1 majuscule, 1 minuscule, 1 caractère spécial
            </p>
            <input
            type="password"
            {...register("mot_de_passe", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            />
            {errors.mot_de_passe && <p className="text-red-500 text-xs whitespace-pre-wrap">{errors.mot_de_passe.message}<br /></p>}
        </div>

        <div
         className="flex flex-col">
            <label className="text-sm font-medium mb-1">Confirmation du mot de passe <strong className="text-orange-500">*</strong></label>
            <input
            type="password"
            {...register("confirmation_mot_de_passe", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            />
            {errors.confirmation_mot_de_passe && <p className="text-red-500 text-xs">{errors.confirmation_mot_de_passe.message}</p>}
        </div>

        <button
            type="submit"
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-md"
        >
            Confirmation
        </button>

        <p className="text-center text-sm text-gray-700 underline font-medium mt-2 cursor-pointer">
            S’inscrire en tant que professionnel ?
        </p>
        </form>

    )
}