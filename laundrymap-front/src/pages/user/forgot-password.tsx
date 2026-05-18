import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Link } from "react-router-dom"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"

type Inputs = {
    email: string
}

export default function ForgotPassword() {
    const [successMessage, setSuccessMessage] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/mot_de_passe/oublie`,
                { email: donnees.email },
                { withCredentials: true }
            )
            setSuccessMessage("Si un compte actif existe pour cet email, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail.")
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError("email", { type: "server", message: err.response.data.message })
            } else {
                setError("email", { type: "server", message: "Impossible d'envoyer le mail de réinitialisation." })
            }
        }
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 lg:gap-0 p-6 md:p-10">

                <div className="flex justify-center gap-2">
                    <a href="https://ec2e.com/" target="_blank" className="flex items-center gap-2 font-medium">
                        <img src="/logo_ec2e.png" alt="LaundryMap" className="w-82" />
                    </a>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                            <FieldGroup>

                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                                    </p>
                                </div>

                                {successMessage && (
                                    <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl text-sm">
                                        {successMessage}
                                    </div>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        {...register("email", { required: "L'adresse email est requise." })}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </Field>

                                <Field>
                                    <Button type="submit">Recevoir un lien de réinitialisation</Button>
                                </Field>

                                <div className="text-center text-sm">
                                    <Link to="/user/login" className="text-blue-600 underline underline-offset-4">
                                        Retour à la connexion
                                    </Link>
                                </div>

                            </FieldGroup>
                        </form>

                    </div>
                </div>

            </div>

            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/laundry_cartoon.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
