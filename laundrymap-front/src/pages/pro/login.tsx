import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/context/AuthContext"
import { Field, FieldDescription, FieldLabel, FieldGroup } from "@/components/ui/field"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { RedirectDialog } from "@/components/ui/RedirectDialog"
import { useTranslation } from "react-i18next"



type Inputs = {
    email: string
    mot_de_passe: string
}

const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/login_check`

function ProLogin() {

    const { t } = useTranslation()

    const { login } = useAuth()
    const [successMessage, setSuccessMessage] = useState("")
    const [redirectOpen, setRedirectOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("")
            }, 3000)
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
            const reponse = await axios.post(
                url, {
                    email: donnees.email,
                    mot_de_passe: donnees.mot_de_passe
                },
                {
                    headers: { "Content-Type": "application/json" } 
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

            localStorage.setItem("token", data.token_data)
            login(data.token_data)
            setSuccessMessage("Connexion réussie !")
            setRedirectOpen(true)

        } catch (erreur) {
            console.error("Erreur lors de la connexion :", erreur)
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

                            {successMessage && (
                                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                                    {successMessage}
                                </div>
                            )}

                            <FieldGroup>

                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">{t("connexion")}</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        {t("connexion")}  {t("en_tant_que_professionnel")}
                                    </p>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                                    <Input id="email" type="email" placeholder="lambert@example.net" required {...register("email", { required: "L'email est requis" })}/>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </Field>

                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="mot_de_passe">{t("mot_de_passe")}</FieldLabel>
                                        <a
                                        href="/pro/mot-de-passe-oublie"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                        {t("mot_de_passe_oublie")}
                                        </a>
                                    </div>
                                    <Input id="mot_de_passe" type="password" required {...register("mot_de_passe", { required: "Le mot de passe est requis" })}/>
                                    {errors.mot_de_passe && <p className="text-red-500 text-sm mt-1">{errors.mot_de_passe.message}</p>}
                                </Field>

                                <Field>
                                    <Button type="submit">{t("connexion")}</Button>
                                </Field>
                                       
                                <Field>
                                    <FieldDescription className="text-center">
                                        {t("pas_de_compte")}{" "}
                                        <a href="/pro/inscription" className="underline underline-offset-4">
                                            {t("inscription")}
                                        </a>
                                    </FieldDescription>
                                </Field>

                            </FieldGroup>

                            <RedirectDialog
                                open={redirectOpen}
                                title="Connexion réussie !"
                                message="Vous êtes maintenant connecté en tant que professionnel."
                                destinationLabel="votre tableau de bord"
                                duration={1500}
                                onNavigate={() => navigate("/pro/dashboard")}
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

export default ProLogin