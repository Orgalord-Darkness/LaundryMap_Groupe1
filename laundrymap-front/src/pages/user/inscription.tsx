import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CGUAcceptCheckbox } from "@/components/ui/CGUAcceptCheckbox"
import GoogleLoginButton from "@/components/utils/google"
import axios from "axios"
import { Field, FieldDescription, FieldLabel, FieldGroup, FieldSeparator } from "@/components/ui/field"
import { useTranslation } from "react-i18next"
import PasswordChecklist from "react-password-checklist"

type Inputs = {
    prenom: string
    nom: string
    email: string
    mot_de_passe: string
    confirmation_mot_de_passe: string
}

const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/inscription`

const INSCRIPTION_DRAFT_KEY = "laundrymap_inscription_draft";

function loadDraft(): Partial<Inputs> {
    try {
        const saved = sessionStorage.getItem(INSCRIPTION_DRAFT_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

export default function Inscription() {

    const { t } = useTranslation()

    const [successMessage, setSuccessMessage] = useState("");
    const [cguAccepted, setCguAccepted] = useState(
        () => localStorage.getItem('laundrymap_cgu_read') === 'true'
    );
    
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
        watch,
        formState: { errors },
        setError,
    } = useForm<Inputs>({
        defaultValues: loadDraft()
    })

    const [prenom, nom, email] = watch(['prenom', 'nom', 'email'])

    useEffect(() => {
        if (prenom || nom || email) {
            sessionStorage.setItem(INSCRIPTION_DRAFT_KEY, JSON.stringify({ prenom, nom, email }));
        }
    }, [prenom, nom, email])
    
    const onSubmit: SubmitHandler<Inputs> = async (donnees) => {
        try {
            const reponse = await axios.post(url, {
                email: donnees.email,
                mot_de_passe: donnees.mot_de_passe,
                prenom: donnees.prenom,
                nom: donnees.nom,
                confirmation_mot_de_passe: donnees.confirmation_mot_de_passe
            }, { withCredentials: true });

            console.log(reponse.status); 

            sessionStorage.removeItem(INSCRIPTION_DRAFT_KEY);
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

                        <form onSubmit={handleSubmit(onSubmit)} aria-labelledby="form-title" aria-describedby="form-description" noValidate className="flex flex-col gap-6">

                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">{t("inscription")}</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        {t('inscription')} {t('en_tant_que_utilisateur')}
                                    </p>
                                </div>

                                <a href="/pro/inscription" className="text-center text-sm text-foreground underline font-medium cursor-pointer" aria-label="S'inscrire en tant que professionnel">
                                    {t('inscription')} {t('en_tant_que_professionnel')} ?
                                </a>

                                {successMessage && (
                                    <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl">
                                        {successMessage}
                                    </div>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="prenom">{t("firstname")}<strong className="text-orange-500" aria-hidden="true">*</strong></FieldLabel>
                                    <Input id="prenom" type="text" aria-describedby={errors.prenom ? "prenom-error" : undefined} tabIndex={1} placeholder="John"
                                        {...register("prenom", { required: true })}
                                    />
                                    {errors.prenom && ( <p id="prenom-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1"> {errors.prenom.message} </p> )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="nom">{t("lastname")}<strong className="text-orange-500" aria-hidden="true">*</strong></FieldLabel>
                                    <Input id="nom" type="text" aria-describedby={errors.nom ? "nom-error" : undefined} tabIndex={2} placeholder="Doe" {...register("nom", { required: true })} />
                                    {errors.nom && ( <p id="nom-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1"> {errors.nom.message} </p> )}
                                </Field>
                                
                                <Field>
                                    <FieldLabel htmlFor="email">{t("email")}<strong className="text-orange-500" aria-hidden="true">*</strong></FieldLabel>
                                    <Input id="email" type="email" aria-describedby={errors.email ? "email-error" : undefined} tabIndex={3} placeholder="john.doe@example.com" {...register("email", { required: true })} />
                                    {errors.email && ( <p id="email-error" role="alert" className="text-red-500 dark:text-red-400 text-xs whitespace-pre-wrap"> {errors.email.message} </p> )}
                                </Field>

                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="mot_de_passe">{t("mot_de_passe")}<strong className="text-orange-500" aria-hidden="true">*</strong></FieldLabel>
                                    </div>

                                    <Input id="mot_de_passe" type="password" aria-describedby={ errors.mot_de_passe ? "mot_de_passe-hint mot_de_passe-error" : "mot_de_passe-hint" } tabIndex={4} {...register("mot_de_passe", { required: true })} />
                                    <FieldDescription>{t("password_infos")}</FieldDescription>
                                    <PasswordChecklist
                                        rules={["minLength", "capital", "lowercase", "number", "specialChar"]}
                                        minLength={8}
                                        value={watch("mot_de_passe") ?? ""}
                                        messages={{
                                            minLength:   t("password_rule_length"),
                                            capital:     t("password_rule_uppercase"),
                                            lowercase:   t("password_rule_lowercase"),
                                            number:      t("password_rule_number"),
                                            specialChar: t("password_rule_special"),
                                        }}
                                    />
                                    {errors.mot_de_passe && ( <p id="mot_de_passe-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1 whitespace-pre-wrap"> {errors.mot_de_passe.message} </p> )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="confirmation_mot_de_passe">{t("confirm_password")}<strong className="text-orange-500" aria-hidden="true">*</strong></FieldLabel>
                                    <Input aria-label="Confirmation du mot de passe" id="confirmation_mot_de_passe" type="password" aria-describedby={ errors.confirmation_mot_de_passe ? "confirmation-error" : undefined } tabIndex={5} {...register("confirmation_mot_de_passe", { required: true })} />
                                    {errors.confirmation_mot_de_passe && ( <p id="confirmation-error" role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1"> {errors.confirmation_mot_de_passe.message} </p> )}
                                </Field>

                                <CGUAcceptCheckbox checked={cguAccepted} onChange={setCguAccepted} />

                                <Field>
                                    <Button type="submit" tabIndex={6} aria-label="Confirmer l'inscription" disabled={!cguAccepted}>{t("inscription")}</Button>
                                </Field>

                                <FieldSeparator>{t("continuer_avec")}</FieldSeparator>

                                <Field>
                                    <GoogleLoginButton route={`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/inscription/google`} title="S'inscrire avec Google" onSuccess={() => setSuccessMessage("Connexion Google réussie !")} />
 
                                    <FieldDescription className="text-center">
                                        {t("already_account")}{" "}
                                        <a href="/user/login" className="underline underline-offset-4">
                                            {t("connexion")}
                                        </a>
                                    </FieldDescription>
                                </Field>

                            </FieldGroup>

                        </form>

                    </div>
                </div>
            </div>

            <div className="relative hidden bg-muted lg:block">
                <img src="/laverienew.png" alt="Image" className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
            </div>
        </div>


    </>
    )
}