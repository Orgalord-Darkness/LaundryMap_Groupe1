import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Header } from "@/components/layout/Header";

function ProInscription() {

  // Infos Pro
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Infos Entreprises
  const [companyName, setCompanyName] = useState("");
  const [siren, setSiren] = useState("");
  const [adress, setAdress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [codeAPE, setCodeAPE] = useState("");

  const [errors, setErrors] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    companyName: "",
    siren: "",
    adress: "",
    city: "",
    country: "",
    codeAPE: "",
  });


  // validation formulaire
  const validateForm = () => {
  
    const newErrors = {
      lastname: "",
      firstname: "",
      email: "",
      password: "",
      companyName: "",
      siren: "",
      adress: "",
      city: "",
      country: "",
      codeAPE: "",
    };

    if (!lastname) {
      newErrors.lastname = "Le nom est requis";
    }

    if (!firstname) {
      newErrors.firstname = "Le prénom est requis";
    }

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };


  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    if (validateForm()) {

      fetch("/api/pro/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastname: lastname,
          firstname: firstname,
          email: email,
          password: password,
          companyName: companyName,
          siren: siren,
          adress: adress,
          city: city,
          country: country,
          codeAPE: codeAPE,
        }),
      })
      .then((response) => response.json())
 
    }
  };


  return (
    <>
    <Header />

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Inscription</h1>
        <p className="flex flex-col items-center justify-center text-gray-500 ">Créer un compte professionnel</p>
        
        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-lastname">Nom<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-lastname" type="text" placeholder="Nom" value={lastname} onChange={(event) => setLastname(event.target.value)} className='h-11'/>
          {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-firstname">Prénom<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-firstname" type="text" placeholder="Prénom" value={firstname} onChange={(event) => setFirstname(event.target.value)} className='h-11'/>
          {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-email">Email <span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-email" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} className='h-11'/>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-password">Mot de passe <span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-password" type="password" placeholder="Mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 "/>
          <FieldDescription>Longueur minimal : 8 caractères</FieldDescription>
          <FieldDescription>Utiliser au moins : 1 majuscule, 1 minuscule, 1 caractère spécial</FieldDescription>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </Field>

        <p className="flex flex-col items-center justify-center text-gray-500 mt-7">Informations entreprise</p>
        <div className="flex items-center mx-auto pb-3 w-55 border-b-2 border-gray-300"></div>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-companyName">Nom de l'entreprise<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-companyName" type="text" placeholder="Nom de l'entreprise" value={companyName} onChange={(event) => setCompanyName(event.target.value)} className='h-11'/>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-siren">Numéro de SIREN<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-siren" type="text" placeholder="Numéro de SIREN" value={siren} onChange={(event) => setSiren(event.target.value)} className='h-11'/>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-adress">Adresse<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-adress" type="text" placeholder="Adresse" value={adress} onChange={(event) => setAdress(event.target.value)} className='h-11'/>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-city">Ville<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-city" type="text" placeholder="Ville" value={city} onChange={(event) => setCity(event.target.value)} className='h-11'/>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-country">Pays<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-country" type="text" placeholder="Pays" value={country} onChange={(event) => setCountry(event.target.value)} className='h-11'/>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-codeApe">Code APE<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-codeApe" type="text" placeholder="Code APE" value={codeAPE} onChange={(event) => setCodeAPE(event.target.value)} className='h-11'/>
        </Field>

        <div className='flex flex-col items-center justify-center my-12'>
          <Button type="submit">Inscription</Button>
        </div>

      </form>

    </>
  )
}

export default ProInscription