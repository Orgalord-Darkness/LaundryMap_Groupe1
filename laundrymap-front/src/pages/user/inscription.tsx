import {useForm, type SubmitHandler} from "react-hook-form"

type Inputs = {
    prenom: string
    nom: string
    email: string
    mot_de_passe: string
}

export default function Inscription() {
    const {
        register, 
        handleSubmit, 
        watch,
        formState: { errors },
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = (donnees) => console.log(donnees)

    return (
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-lg"
        >
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Inscription
        </h2>

        {/* Prénom */}
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Prénom <strong className="text-orange-500">*</strong></label>
            <input
            type="text"
            {...register("prenom", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="John"
            />
        </div>

        {/* Nom */}
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Nom <strong className="text-orange-500">*</strong></label>
            <input
            type="text"
            {...register("nom", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="Doe"
            />
        </div>

        {/* Email */}
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Email <strong className="text-orange-500">*</strong></label>
            <input
            type="email"
            {...register("email", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="john.doe@example.com"
            />
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Mot de passe <strong className="text-orange-500">*</strong></label>
            <input
            type="password"
            {...register("mot_de_passe", { required: true })}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
            placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">
            Min. 8 caractères, 1 majuscule, 1 minuscule, 1 caractère spécial
            </p>
        </div>

        {/* Bouton */}
        <button
            type="submit"
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-md"
        >
            Confirmation
        </button>

        {/* Lien pro */}
        <p className="text-center text-sm text-gray-600 underline font-medium mt-2 cursor-pointer">
            S’inscrire en tant que professionnel ?
        </p>

        {/* Google */}
        <button
            type="button"
            className="mt-3 w-full border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">S’inscrire avec Google</span>
        </button>
        </form>

    )
}