import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import GoogleLoginButton from "@/components/utils/google"
import axios from "axios"

type Inputs = {
    prenom: string
    nom: string
    email: string
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/inscription`

export default function Inscription() {
    const [successMessage, setSuccessMessage] = useState("");
    
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("")
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<Inputs>()
    
    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            const reponse = await axios.post(url, {
                email: donnees.email,
                mot_de_passe: donnees.mot_de_passe,
                prenom: donnees.prenom,
                nom: donnees.nom,
                confirmation_mot_de_passe: donnees.confirmation_mot_de_passe
            });

            setSuccessMessage("Inscription réussie ! Vérifiez votre email.");
            
        } catch (erreur) {
            if (axios.isAxiosError(erreur) && erreur.response) {
                const erreursServeur = erreur.response.data;

                Object.keys(erreursServeur).forEach((champ) => {
                    setError(champ as keyof Inputs, {
                        type: "server",
                        message: erreursServeur[champ],
                    });
                });

                return;
            }

            console.error("Erreur inconnue :", erreur);
        }
    };


    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg">
            <form
            onSubmit={handleSubmit(onSubmit)}
            aria-labelledby="form-title"
            aria-describedby="form-description"
            noValidate
            >
                <h2
                    id="form-title"
                    className="text-2xl font-semibold text-gray-900 text-center mb-2"
                >
                    Inscription
                </h2>
                <p id="form-description" className="text-gray-600 text-center">
                    Créer un compte utilisateur
                </p>

                {successMessage && (
                    <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl"
                    >
                    {successMessage}
                    </div>
                )}

                <div className="flex flex-col">
                    <label
                    htmlFor="prenom"
                    className="text-sm font-medium mb-1"
                    >
                    Prénom{" "}
                    <strong className="text-orange-500" aria-hidden="true">*</strong>
                    </label>
                    <Input
                    id="prenom"
                    type="text"
                    aria-describedby={errors.prenom ? "prenom-error" : undefined}
                    tabIndex={1}
                    placeholder="John"
                    {...register("prenom", { required: true })}
                    />
                    {errors.prenom && (
                    <p id="prenom-error" role="alert" className="text-red-500 text-xs mt-1">
                        {errors.prenom.message}
                    </p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label
                    htmlFor="nom"
                    className="text-sm font-medium mb-1"
                    >
                    Nom{" "}
                    <strong className="text-orange-500" aria-hidden="true">*</strong>
                    </label>
                    <Input
                    id="nom"
                    type="text"
                    aria-describedby={errors.nom ? "nom-error" : undefined}
                    tabIndex={2}
                    placeholder="Doe"
                    {...register("nom", { required: true })}
                    />
                    {errors.nom && (
                    <p id="nom-error" role="alert" className="text-red-500 text-xs mt-1">
                        {errors.nom.message}
                    </p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label
                    htmlFor="email"
                    className="text-sm font-medium mb-1"
                    >
                    Email{" "}
                    <strong className="text-orange-500" aria-hidden="true">*</strong>
                    </label>
                    <Input
                    id="email"
                    type="email"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    tabIndex={3}
                    placeholder="john.doe@example.com"
                    {...register("email", { required: true })}
                    />
                    {errors.email && (
                    <p id="email-error" role="alert" className="text-red-500 text-xs mt-1 whitespace-pre-wrap">
                        {errors.email.message}
                    </p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label
                    htmlFor="mot_de_passe"
                    className="text-sm font-medium mb-1"
                    >
                    Mot de passe{" "}
                    <strong className="text-orange-500" aria-hidden="true">*</strong>
                    </label>
                    <p id="mot_de_passe-hint" className="text-xs text-gray-500 mt-1">
                    Longueur minimale : 8 caractères.{" "}
                    Utiliser minimum 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
                    </p>
                    <Input
                    id="mot_de_passe"
                    type="password"
                    aria-describedby={
                        errors.mot_de_passe
                        ? "mot_de_passe-hint mot_de_passe-error"
                        : "mot_de_passe-hint"
                    }
                    tabIndex={4}
                    {...register("mot_de_passe", { required: true })}
                    />
                    {errors.mot_de_passe && (
                    <p id="mot_de_passe-error" role="alert" className="text-red-500 text-xs mt-1 whitespace-pre-wrap">
                        {errors.mot_de_passe.message}
                    </p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label
                    htmlFor="confirmation_mot_de_passe"
                    className="text-sm font-medium mb-1"
                    >
                    Confirmation du mot de passe{" "}
                    <strong className="text-orange-500" aria-hidden="true">*</strong>
                    </label>
                    <Input
                    aria-label="Confirmation du mot de passe"
                    id="confirmation_mot_de_passe"
                    type="password"
                    aria-describedby={
                        errors.confirmation_mot_de_passe
                        ? "confirmation-error"
                        : undefined
                    }
                    tabIndex={5}
                    {...register("confirmation_mot_de_passe", { required: true })}
                    />
                    {errors.confirmation_mot_de_passe && (
                    <p id="confirmation-error" role="alert" className="text-red-500 text-xs mt-1">
                        {errors.confirmation_mot_de_passe.message}
                    </p>
                    )}
                </div>

                <Button
                    type="submit"
                    tabIndex={6}
                    className="mt-4 w-full"
                    aria-label="Confirmer l'inscription"
                >
                    Confirmation
                </Button>

                <a
                    href='/pro/inscription'
                    role="button"
                    tabIndex={7}
                    aria-label="S'inscrire en tant que professionnel"
                    className="text-center text-sm text-gray-700 underline font-medium mt-2 cursor-pointer"
                >
                    S'inscrire en tant que professionnel ?
                </a>
            </form>
             <GoogleLoginButton
                route={`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/inscription/google`}
                title="S'inscrire avec Google"
                onSuccess={() => setSuccessMessage("Connexion Google réussie !")}
            />
        </div>
    )
}