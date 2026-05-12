import { useForm, type SubmitHandler } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"

type Inputs = {
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setError,
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        if (!token) {
            setError("mot_de_passe", { type: "manual", message: "Token de réinitialisation manquant." })
            return
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/mot_de_passe/reinitialisation`,
                {
                    reset_token: token,
                    mot_de_passe: donnees.mot_de_passe,
                    confirmation_mot_de_passe: donnees.confirmation_mot_de_passe,
                }
            )
            navigate("/user/login")
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError("mot_de_passe", { type: "server", message: err.response.data.message })
            } else {
                setError("mot_de_passe", { type: "server", message: "Impossible de réinitialiser le mot de passe." })
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
                                    <h1 className="text-2xl font-bold">Réinitialisation du mot de passe</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        Choisissez un nouveau mot de passe sécurisé.
                                    </p>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="mot_de_passe">Nouveau mot de passe</FieldLabel>
                                    <p className="text-xs text-gray-500">
                                        Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 caractère spécial
                                    </p>
                                    <Input
                                        id="mot_de_passe"
                                        type="password"
                                        {...register("mot_de_passe", {
                                            required: "Le mot de passe est requis.",
                                        })}
                                    />
                                    {errors.mot_de_passe && (
                                        <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="confirmation_mot_de_passe">Confirmer le mot de passe</FieldLabel>
                                    <Input
                                        id="confirmation_mot_de_passe"
                                        type="password"
                                        {...register("confirmation_mot_de_passe", {
                                            required: "La confirmation est requise.",
                                            validate: (value) =>
                                                value === watch("mot_de_passe") ||
                                                "La confirmation ne correspond pas.",
                                        })}
                                    />
                                    {errors.confirmation_mot_de_passe && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.confirmation_mot_de_passe.message}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <Button type="submit">Réinitialiser le mot de passe</Button>
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
