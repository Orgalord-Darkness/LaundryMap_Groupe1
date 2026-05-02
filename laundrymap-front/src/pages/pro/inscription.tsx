import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { CGUAcceptCheckbox } from "@/components/ui/CGUAcceptCheckbox"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function ProInscription() {

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/pro/inscription`
  const [googlePrefilled, setGooglePrefilled] = useState(false)
  
  // Infos Pro
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Infos Entreprise
  const [siren, setSiren] = useState("");
  const [adress, setAdress] = useState("");
  const [rue, setRue] = useState("");           
  const [codePostal, setCodePostal] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

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
    const newErrors = {
      lastname:   !lastname   ? "Le nom est requis"      : "",
      firstname:  !firstname  ? "Le prénom est requis"   : "",
      email:      !email      ? "L'email est requis" : (!email.includes("@") || !email.includes(".")) ? "Email invalide" : "",
      password:   !password   ? "Le mot de passe est requis" : password.length < 8 ? "Le mot de passe doit contenir au moins 8 caractères" : "",
      siren:      !siren      ? "Le numéro SIREN est requis" : !/^\d{9}$/.test(siren) ? "Le SIREN doit contenir exactement 9 chiffres" : "",
      adress:     !adress     ? "L'adresse est requise"     : "",
      rue:        !rue        ? "La rue est requise"        : "",   
      codePostal: !codePostal ? "Le code postal est requis" : "",
      city:       !city       ? "La ville est requise"      : "",
      country:    !country    ? "Le pays est requis"        : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError("");
    setSuccess("");

    if (!validateForm()) return;

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
    })
    const data = response.data

    if(data.errors) { 
      setApiError("Une erreur est survenue lors de l'inscription. Veuillez vérifier les informations saisies.")
      return
    }

    setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.")
    navigate("/pro/login")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Inscription</h1>
        <p className="flex flex-col items-center justify-center text-gray-500">Créer un compte professionnel</p>

        {apiError && <p className="text-red-500 text-sm mt-4 font-semibold">{apiError}</p>}
        {success  && <p className="text-green-600 text-sm mt-4 font-semibold">{success}</p>}

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-lastname">Nom<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-lastname" type="text" placeholder="Nom" value={lastname} className={`h-11 ${googlePrefilled ? 'border-green-400 bg-green-50' : ''}`} onChange={(e) => setLastname(e.target.value)} />
          {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-firstname">Prénom<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-firstname" type="text" placeholder="Prénom" className={`h-11 ${googlePrefilled ? 'border-green-400 bg-green-50' : ''}`}  value={firstname} onChange={(e) => setFirstname(e.target.value)} />
          {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-lastname">Nom<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-lastname" type="text" placeholder="Nom" value={lastname} onChange={(e) => setLastname(e.target.value)} className='h-11'/>
          {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-email">Email<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-email" type="email" placeholder="Email" className={`h-11 ${googlePrefilled ? 'border-green-400 bg-green-50' : ''}`}  value={email} onChange={(e) => setEmail(e.target.value)}/>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-password">Mot de passe<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-password" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className='h-11'/>
          <FieldDescription>Longueur minimale : 8 caractères</FieldDescription>
          <FieldDescription>Utiliser au moins : 1 majuscule, 1 chiffre, 1 caractère spécial</FieldDescription>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </Field>

        <p className="flex flex-col items-center justify-center text-gray-500 mt-7">Informations entreprise</p>
        <div className="flex items-center mx-auto pb-3 w-55 border-b-2 border-gray-300"></div>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-siren">Numéro de SIREN<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-siren" type="text" placeholder="9 chiffres" maxLength={9} value={siren} onChange={(e) => setSiren(e.target.value)} className='h-11'/>
          {errors.siren && <p className="text-red-500 text-sm mt-1">{errors.siren}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-rue">Numéro de rue<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-rue" type="text" placeholder="Ex : 12" value={rue} onChange={(e) => setRue(e.target.value)} className='h-11'/>
          {errors.rue && <p className="text-red-500 text-sm mt-1">{errors.rue}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-adress">Adresse<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-adress" type="text" placeholder="Ex : Rue de la place" value={adress} onChange={(e) => setAdress(e.target.value)} className='h-11'/>
          {errors.adress && <p className="text-red-500 text-sm mt-1">{errors.adress}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-codePostal">Code postal<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-codePostal" type="text" placeholder="Code postal" value={codePostal} onChange={(e) => setCodePostal(e.target.value)} className='h-11'/>
          {errors.codePostal && <p className="text-red-500 text-sm mt-1">{errors.codePostal}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-city">Ville<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-city" type="text" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} className='h-11'/>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-country">Pays<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-country" type="text" placeholder="Pays" value={country} onChange={(e) => setCountry(e.target.value)} className='h-11'/>
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
        </Field>

        <div className='w-85 m-auto mt-6'>
          <CGUAcceptCheckbox checked={cguAccepted} onChange={setCguAccepted} />
        </div>

        <div className='flex flex-col items-center justify-center my-6'>
          <Button type="submit" disabled={!cguAccepted}>Inscription</Button>
        </div>
        <div className="flex flex-col items-center gap-2 mt-4 mb-2">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.error('Erreur Google')}
                  text="continue_with"
                  useOneTap={false}
              />
          </GoogleOAuthProvider>
          {googlePrefilled && (
              <p className="text-green-600 text-sm">
                  ✓ Nom, prénom et email importés depuis Google — complétez les champs restants.
              </p>
          )}
      </div>
      </form>
    </>
  );
}

export default ProInscription;