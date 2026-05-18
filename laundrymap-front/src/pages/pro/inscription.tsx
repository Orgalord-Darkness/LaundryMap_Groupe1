import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel, FieldGroup, FieldSeparator } from "@/components/ui/field"
import { CGUAcceptCheckbox } from "@/components/ui/CGUAcceptCheckbox"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useTranslation } from "react-i18next"
import PasswordChecklist from "react-password-checklist"
import { CountrySelect } from "@/components/ui/CountrySelect"

 

function ProInscription() {

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/inscription`
  const [googlePrefilled, setGooglePrefilled] = useState(false)
  const [sirenPrefilled, setSirenPrefilled] = useState(false)
  const [sirenLoading, setSirenLoading] = useState(false)
  const { t } = useTranslation()
  
  // Infos Pro
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Infos Entreprise
  const [siren, setSiren] = useState("");
  const [adress, setAdress] = useState("");
  const [rue, setRue] = useState("");           
  const [codePostal, setCodePostal] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const handleSirenLookup = async () => {
    setSirenLoading(true)
    setSirenPrefilled(false)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/siren-lookup/${siren}`
      )
      setRue(res.data.voie ?? '')
      setAdress(res.data.numero_voie ?? '')
      setCodePostal(res.data.code_postal ?? '')
      setCity(res.data.commune ?? '')
      setCountry('France')
      setSirenPrefilled(true)
    } catch {
      setSirenPrefilled(false)
    } finally {
      setSirenLoading(false)
    }
  }

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const base64Url = credentialResponse.credential.split('.')[1]
      const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload   = JSON.parse(window.atob(base64))

      setFirstname(payload.given_name  ?? '')
      setLastname(payload.family_name  ?? '')
      setEmail(payload.email           ?? '')
      setGooglePrefilled(true)

    } catch (e) {
      console.error('Erreur décodage token Google', e)
    }
  }


  const [errors, setErrors] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    confirmPassword: "",
    siren: "",
    adress: "",
    rue: "",
    codePostal: "",
    city: "",
    country: "",
  });

  const navigate = useNavigate()
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [cguAccepted, setCguAccepted] = useState(false);

  const validateForm = (): boolean => {
    // TODO(human): implémente la validation du champ confirmPassword ci-dessous.
    // La valeur à valider est `confirmPassword`, à comparer avec `password`.
    // Retourne une chaîne vide si valide, sinon un message d'erreur.
    const confirmPasswordError = "";

    const newErrors = {
      lastname:        !lastname   ? "Le nom est requis"      : "",
      firstname:       !firstname  ? "Le prénom est requis"   : "",
      email:           !email      ? "L'email est requis" : (!email.includes("@") || !email.includes(".")) ? "Email invalide" : "",
      password:        !password   ? "Le mot de passe est requis" : password.length < 8 ? "Le mot de passe doit contenir au moins 8 caractères" : "",
      confirmPassword: confirmPasswordError,
      siren:           !siren      ? "Le numéro SIREN est requis" : !/^\d{9}$/.test(siren) ? "Le SIREN doit contenir exactement 9 chiffres" : "",
      adress:          !adress     ? "L'adresse est requise"     : "",
      rue:             !rue        ? "La rue est requise"        : "",
      codePostal:      !codePostal ? "Le code postal est requis" : "",
      city:            !city       ? "La ville est requise"      : "",
      country:         !country    ? "Le pays est requis"        : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError("");
    setSuccess("");

    if (!validateForm()) return;


    try {

      const response = await axios.post(url, {
        lastname,
        firstname,
        email,
        password,
        siren,
        adress,
        rue,
        codePostal,
        city,
        country,
      }, { withCredentials: true })

      setSuccess(response.data.message) 
      setSuccess("Inscription réussie ! Votre compte professionnel est maintenant en attente de validation par un administrateur.")
      navigate("/pro/login")

    } catch (error: any) {

      const message = error.response?.data?.message
      setApiError(message || "Une erreur est survenue lors de l'inscription.")
    }

    setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.")
    navigate("/pro/login")
  }

  return (
    <>

    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">

        <div className="flex justify-center gap-2">
          <a href="https://ec2e.com/" target="_blank" className="flex items-center gap-2 font-medium">
              <img src="/logo_ec2e.png"  alt="Image" className="w-30" />
            </a>
        </div>

        {apiError && <p className="m-auto text-red-500 dark:text-red-400 text-sm mt-4 font-semibold">{apiError}</p>}
        {success  && <p className="m-auto text-green-600 dark:text-green-400 text-sm mt-4 font-semibold">{success}</p>}

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">


            <form onSubmit={handleSubmit} className="flex flex-col gap-6">


              <FieldGroup>

                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">{t("create_your_account")}</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    {t("fill_form")}
                  </p>
                </div>


                <Field>
                  <FieldLabel htmlFor="lastname">{t("lastname")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="lastname" type="text" placeholder={t("lastname")} value={lastname} className={`${googlePrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''}`}  onChange={(e) => setLastname(e.target.value)} />
                  {errors.lastname && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastname}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="firstname">{t("firstname")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="firstname" type="text" placeholder={t("firstname")} className={`${googlePrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''}`} value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                  {errors.firstname && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstname}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">{t("email")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="email" type="email" placeholder="m@example.com" className={`${googlePrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)}/>
                  {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
                  <FieldDescription> {t("email_informations")} </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">{t("mot_de_passe")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="password" type="password" placeholder={t("mot_de_passe")} value={password} onChange={(e) => setPassword(e.target.value)}/>
                  <FieldDescription>{t("password_infos")}</FieldDescription>
                  <PasswordChecklist
                    rules={["minLength", "capital", "lowercase", "number", "specialChar"]}
                    minLength={8}
                    value={password}
                    messages={{
                      minLength:   t("password_rule_length"),
                      capital:     t("password_rule_uppercase"),
                      lowercase:   t("password_rule_lowercase"),
                      number:      t("password_rule_number"),
                      specialChar: t("password_rule_special"),
                    }}
                  />
                  {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">{t("confirm_password")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={t("confirm_password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </Field>

                <FieldSeparator className="my-5">{t("company_informations")}</FieldSeparator>

                <Field>
                  <FieldLabel htmlFor="siren">{t("siren_number")}<span className='text-orange-600'>*</span></FieldLabel>
                  <FieldDescription>{t("siren_lookup_desc")}</FieldDescription>
                  <div className="flex gap-2 mt-1 w-full">
                    <Input
                      id="siren"
                      type="text"
                      placeholder={t("siren_number")}
                      maxLength={9}
                      value={siren}
                      onChange={(e) => { setSiren(e.target.value); setSirenPrefilled(false) }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSirenLookup}
                      disabled={siren.length !== 9 || sirenLoading}
                      className="whitespace-nowrap px-4"
                    >
                      {sirenLoading ? t("siren_lookup_loading") : t("siren_lookup_button")}
                    </Button>
                  </div>
                  {sirenPrefilled && !sirenLoading && (
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">✓ Informations de l'entreprise importées depuis le SIREN.</p>
                  )}
                  {errors.siren && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.siren}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="rue">{t("street_number")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="rue" type="text" placeholder="Ex : 12" value={rue} className={sirenPrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''} onChange={(e) => setRue(e.target.value)} />
                  {errors.rue && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.rue}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="adress">{t("street_name")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="adress" type="text" placeholder="Ex : Rue de la place" value={adress} className={sirenPrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''} onChange={(e) => setAdress(e.target.value)} />
                  {errors.adress && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.adress}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="codePostal">{t("postal_code")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="codePostal" type="text" placeholder={t("postal_code")} value={codePostal} className={sirenPrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''} onChange={(e) => setCodePostal(e.target.value)} />
                  {errors.codePostal && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.codePostal}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="city">{t("city")}<span className='text-orange-600'>*</span></FieldLabel>
                  <Input id="city" type="text" placeholder={t("city")} value={city} className={sirenPrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''} onChange={(e) => setCity(e.target.value)} />
                  {errors.city && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.city}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="country">{t("country")}<span className='text-orange-600'>*</span></FieldLabel>
                 <CountrySelect
                    id="country"
                    value={country}
                    onChange={setCountry}
                    className={sirenPrefilled ? 'border-green-400 dark:border-green-700 bg-green-50' : ''}
                  />
                  {errors.country && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.country}</p>}
                </Field>

                
                <div className='mt-6'>
                  <CGUAcceptCheckbox checked={cguAccepted} onChange={setCguAccepted} />
                </div>

                <Field>
                  <Button type="submit" disabled={!cguAccepted}>{t("create_your_account")}</Button>
                </Field>

                <FieldSeparator>{t("continuer_avec")}</FieldSeparator>

                <div className="flex flex-col items-center gap-2 my-2">
                  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                      <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => console.error('Erreur Google')}
                          text="continue_with"
                          useOneTap={false}
                      />
                  </GoogleOAuthProvider>
                  {googlePrefilled && (
                      <p className="text-green-600 dark:text-green-400 text-sm">
                          ✓ Nom, prénom et email importés depuis Google — complétez les champs restants.
                      </p>
                  )}
                </div> 


                
                <Field>
                  <FieldDescription className="px-6 text-center">
                    {t("already_account")} <a href="/pro/login">{t("connexion")}</a>
                  </FieldDescription>
                </Field>

              </FieldGroup>
              
            </form>

          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src="/laverienew.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
    
    </>
  );
}

export default ProInscription;