import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type {SubmitHandler } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axios from 'axios'

type Inputs = {
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

export default function NouveauMotDePasse() {
    const [searchParams] = useSearchParams()
    const navigate       = useNavigate()
    const resetToken     = searchParams.get('token')

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/mot_de_passe/reinitialisation`,
                {
                    reset_token:                resetToken,
                    mot_de_passe:               donnees.mot_de_passe,
                    confirmation_mot_de_passe:  donnees.confirmation_mot_de_passe,
                }
            )

            navigate('/login', {
                state: { message: 'Mot de passe défini ! Vous pouvez maintenant vous connecter.' }
            })

        } catch (erreur) {
            if (axios.isAxiosError(erreur) && erreur.response) {
                const erreursServeur = erreur.response.data
                Object.keys(erreursServeur).forEach((champ) => {
                    setError(champ as keyof Inputs, {
                        type: 'server',
                        message: erreursServeur[champ],
                    })
                })
            }
        }
    }

    if (!resetToken) {
        return (
            <p className="text-center text-red-500 mt-10">
                Token manquant ou invalide.
            </p>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Définir votre mot de passe
            </h2>
            <p className="text-gray-500 text-center text-sm">
                Votre compte Google est prêt. Choisissez un mot de passe pour pouvoir aussi vous connecter par email.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

                <div className="flex flex-col">
                    <label htmlFor="mot_de_passe" className="text-sm font-medium mb-1">
                        Mot de passe <strong className="text-orange-500">*</strong>
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                        8 caractères minimum, 1 majuscule, 1 minuscule, 1 caractère spécial.
                    </p>
                    <Input
                        id="mot_de_passe"
                        type="password"
                        aria-describedby={errors.mot_de_passe ? 'mdp-error' : undefined}
                        {...register('mot_de_passe', { required: true })}
                    />
                    {errors.mot_de_passe && (
                        <p id="mdp-error" role="alert" className="text-red-500 text-xs mt-1 whitespace-pre-wrap">
                            {errors.mot_de_passe.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label htmlFor="confirmation_mot_de_passe" className="text-sm font-medium mb-1">
                        Confirmation <strong className="text-orange-500">*</strong>
                    </label>
                    <Input
                        id="confirmation_mot_de_passe"
                        type="password"
                        aria-describedby={errors.confirmation_mot_de_passe ? 'confirm-error' : undefined}
                        {...register('confirmation_mot_de_passe', { required: true })}
                    />
                    {errors.confirmation_mot_de_passe && (
                        <p id="confirm-error" role="alert" className="text-red-500 text-xs mt-1">
                            {errors.confirmation_mot_de_passe.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full mt-2">
                    Confirmer mon mot de passe
                </Button>

            </form>
        </div>
    )
}