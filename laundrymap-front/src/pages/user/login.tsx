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
import { Field, FieldDescription, FieldLabel, FieldGroup, FieldSeparator } from "@/components/ui/field"


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
        <>


        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 lg:gap-0 p-6 md:p-10">

                <div className="flex justify-center gap-2">
                    <a href="https://ec2e.com/" target="_blank" className="flex items-center gap-2 font-medium">
                        <img src="../public/logo_ec2e.png"  alt="Image" className="w-82" />
                    </a>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">{t("connexion")}</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        {t('connexion')} {t('en_tant_que_utilisateur')}
                                    </p>
                                </div>

                                <a href="/pro/login" className="text-center text-sm text-gray-700 underline font-medium cursor-pointer" aria-label="Se connecter en tant que professionnel">
                                    {t('connexion')} {t('en_tant_que_professionnel')} ?
                                </a>

                                {successMessage && (
                                    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                                        {successMessage}
                                    </div>
                                )}
                                

                                <Field>
                                    <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                                    <Input id="email" type="email" placeholder="email@example.com" required {...register("email", { required: true })}/>
                                </Field>

                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="mot_de_passe">{t("mot_de_passe")}</FieldLabel>
                                        <a href="/user/mot-de-passe-oublie" className="ml-auto text-sm underline-offset-4 hover:underline" >
                                            {t("mot_de_passe_oublie")}
                                        </a>
                                    </div>

                                    <Input id="password" type="password" required {...register("mot_de_passe", { required: true })}/>

                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                    {errors.mot_de_passe && (
                                        <p className="text-red-500 text-xs mt-1 whitespace-pre-wrap">
                                            {errors.mot_de_passe.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <Button type="submit">{t("connexion")}</Button>
                                </Field>

                                <FieldSeparator>{t("continuer_avec")}</FieldSeparator>

                                <Field>
                                    <p className="text-center text-sm text-gray-600 mt-4">{t('consigne_co_google')}</p>
                                    <GoogleLoginButton
                                        route={`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/inscription/google`}
                                        title={t("connexion_avec_google")}
                                        onSuccess={() => setSuccessMessage("Connexion Google réussie !")}
                                    />
 
                                    <FieldDescription className="text-center">
                                        {t("pas_de_compte")}{" "}
                                        <a href="/user/inscription" className="underline underline-offset-4">
                                            {t("inscription")}
                                        </a>
                                    </FieldDescription>

                                </Field>

                            </FieldGroup>

                            <RedirectDialog
                                open={redirectOpen}
                                title="Connexion réussie !"
                                message="Vous êtes maintenant connecté."
                                destinationLabel="l'accueil"
                                onNavigate={() => navigate("/")}
                            />

                        </form>

                    </div>
                </div>

            </div>

            <div className="relative hidden bg-muted lg:block">
                <img src="../public/laundry_cartoon.jpg" alt="Image"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
            </div>
        </div>
       

    </>
    )
}