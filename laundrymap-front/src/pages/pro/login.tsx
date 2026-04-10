import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/context/AuthContext"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import axios from "axios"
import { useNavigate } from "react-router-dom"

type Inputs = {
    email: string
    mot_de_passe: string
}

const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/login_check`

function ProLogin() {
    const { login } = useAuth()
    const [successMessage, setSuccessMessage] = useState("")
    const navigate = useNavigate()

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
            navigate("/pro/dashboard"); 

        } catch (erreur) {
            console.error("Erreur lors de la connexion :", erreur)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center p-4">

            <h1 className="font-bold text-2xl mt-6">Connexion</h1>
            <p className="text-gray-500 text-center mt-2">Se connecter en tant que professionnel</p>

            {successMessage && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                    {successMessage}
                </div>
            )}

            <Field className="w-11/12 max-w-md mt-16">
                <FieldLabel htmlFor="email">Email <span className="text-orange-600">*</span></FieldLabel>
                <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="h-11"
                    {...register("email", { required: "L'email est requis" })}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </Field>

            <Field className="w-11/12 max-w-md mt-4">
                <FieldLabel htmlFor="mot_de_passe">Mot de passe <span className="text-orange-600">*</span></FieldLabel>
                <Input
                    id="mot_de_passe"
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                    {...register("mot_de_passe", { required: "Le mot de passe est requis" })}
                />
                <FieldDescription>Ne communiquez pas votre mot de passe.</FieldDescription>
                {errors.mot_de_passe && <p className="text-red-500 text-sm mt-1">{errors.mot_de_passe.message}</p>}
            </Field>

            <p className="text-sm text-right w-11/12 max-w-md mt-2">
                <a href="/pro/mot-de-passe-oublie" className="text-blue-500 hover:underline">Mot de passe oublié ?</a>
            </p>

            <div className="w-11/12 max-w-md mt-4 text-center">
                <p className="text-sm inline">Pas de compte ?{" "}
                    <a href="/pro/inscription" className="text-blue-500 hover:underline">S'inscrire</a>
                </p>
            </div>

            <div className="w-11/12 max-w-md mt-8">
                <Button type="submit" className="w-full">Connexion</Button>
            </div>

        </form>
    )
}

export default ProLogin