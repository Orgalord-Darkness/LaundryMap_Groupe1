import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/context/AuthContext"
import GoogleLoginButton from "@/components/utils/google"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { RedirectDialog } from "@/components/ui/RedirectDialog"

type Inputs = {
    email: string
    mot_de_passe: string
}

const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/login_check`

export default function Connexion() {
    const { t } = useTranslation()
    const { login } = useAuth()
    const [successMessage, setSuccessMessage] = useState("")
    const [redirectOpen, setRedirectOpen] = useState(false)
    
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
    
    const navigate = useNavigate()
    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            const reponse = await axios.post(
                url,{
                    email: donnees.email,
                    mot_de_passe: donnees.mot_de_passe
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            )

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

            localStorage.setItem("token", data.token_data)
            login(data.token_data)

            setSuccessMessage("Connexion réussie !")
            setRedirectOpen(true)

        } catch (erreur) {
            console.error("Erreur lors de la connexion :", erreur)

            if (axios.isAxiosError(erreur) && erreur.response) {
                const data = erreur.response.data

                if (data && typeof data === "object") {
                    Object.keys(data).forEach((champ) => {
                        setError(champ as keyof Inputs, {
                            type: "server",
                            message: data[champ],
                        })
                    })
                    return
                }
            }

            setError("email", {
                type: "server",
                message: "Erreur lors de la connexion. Veuillez vérifier vos identifiants.",
            })
        }

    }


    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg"
        >
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                {t('connexion')}
            </h2>
            <p className="text-gray-600 text-center">
                {t('connexion')} {t('en_tant_que_utilisateur')}
            </p>

            <a href="/pro/login" className="text-center text-sm text-gray-700 underline font-medium cursor-pointer" aria-label="Se connecter en tant que professionnel">
                Se connecter en tant que professionnel ?
            </a>

            {successMessage && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                    {successMessage}
                </div>
            )}

            <div className="flex flex-col">
                <label className="text-sm font-medium mb-1" aria-label="Email">
                    Email <strong className="text-red-500">*</strong>
                </label>
                <Input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="Email"
                    aria-label="Email"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                    Mot de passe <strong className="text-red-500">*</strong>
                </label>
                <Input
                    type="password"
                    {...register("mot_de_passe", { required: true })}
                    placeholder="Mot de passe"
                    aria-label="Mot de passe"   
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
                {errors.mot_de_passe && (
                    <p className="text-red-500 text-xs mt-1 whitespace-pre-wrap">
                        {errors.mot_de_passe.message}
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <a href="/user/mot-de-passe-oublie" className="text-sm text-gray-700 underline underline-offset-2 hover:text-[#1e90d6] transition-colors" aria-label="Mot de passe oublié">
                    Mot de passe oublié ?
                </a>
            </div>

            <a href='/user/inscription' className="text-center text-sm text-gray-700 underline font-medium cursor-pointer" aria-label="S'inscrire en tant qu'utilisateur">
                Pas de compte ? Cliquer ici pour s'inscrire
            </a>

            <Button type="submit" className="mt-2 w-full h-12 rounded-xl" aria-label='Se connecter'>
                Se connecter
            </Button>
            <GoogleLoginButton
                route={`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/inscription/google`}
                title='Se connecter avec Google'
                onSuccess={() => setSuccessMessage("Connexion Google réussie !")}
            />
        <RedirectDialog
            open={redirectOpen}
            title="Connexion réussie !"
            message="Vous êtes maintenant connecté."
            destinationLabel="l'accueil"
            onNavigate={() => navigate("/")}
          />
        </form>
    )
}
