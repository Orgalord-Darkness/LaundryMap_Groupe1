import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";


function ProLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

 // validation formulaire
  const validateForm = () => {
  
    const newErrors = { email: "", password: "" };

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
    event.preventDefault(); // Empêche le rechargement de la page

    if (validateForm()) {

      fetch("/api/pro/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })
      .then((response) => response.json())
 
    }
  };

  return (
    <>

    <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

      <h1 className="font-bold text-2xl mt-6">Connexion</h1>
      <p className="text-gray-500 text-center mt-2">Se connecter en tant que professionnel</p>

      <Field className="w-11/12 max-w-md mt-16">
        <FieldLabel htmlFor="email">Email <span className="text-orange-600">*</span></FieldLabel>
        <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11"/>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </Field>

      <Field className="w-11/12 max-w-md mt-4">
        <FieldLabel htmlFor="password">Mot de passe <span className="text-orange-600">*</span></FieldLabel>
        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
        <FieldDescription>Ne communiquez pas votre mot de passe.</FieldDescription>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </Field>

      <p className="text-sm text-right w-11/12 max-w-md mt-2">
        <a href="/pro/mot-de-passe-oublie" className="text-blue-500 hover:underline">Mot de passe oublié ?</a>
      </p>

      <div className="w-11/12 max-w-md mt-4 text-center">
        <p className="text-sm inline"> Pas de compte ?{" "}
          <a href="/pro/inscription" className="text-blue-500 hover:underline">S'inscrire</a>
        </p>
      </div>

      <div className="w-11/12 max-w-md mt-8">
        <Button type="submit" className="w-full">Connexion</Button>
      </div>

    </form>

    </>
  )
}

export default ProLogin;






// import { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

// function ProLogin() {

//   return (
//     <>
//       <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Connexion</h1>
//       <p className="flex flex-col items-center justify-center text-gray-500 ">Se connecter en tant que professionnel</p>
      

//         <Field className='w-85 m-auto items-center justify-center mt-20'>
//           <FieldLabel htmlFor="input-field-email">Email <span className='text-orange-600'>*</span></FieldLabel>
//           <Input id="input-field-email" type="email" placeholder="Email" className='h-11'/>
//         </Field>

//         <Field className='w-85 m-auto items-center justify-center mt-10'>
//           <FieldLabel htmlFor="input-field-password">Mot de passe <span className='text-orange-600'>*</span></FieldLabel>
//           <Input id="input-field-password" type="password" placeholder="Mot de passe" className="h-11 "/>
//           <FieldDescription>Choisissez un mot de passe fort & unique.</FieldDescription>
//         </Field>

//         <p className="flex flex-col items-end mt-5 mr-5">Mot de passe oublié ?</p>
//         <div className='flex flex-col items-center justify-center'>
//         <p className="flex flex-col items-center mt-10 inline">Pas de compte ? 
//           <a href="/pro/inscription" className="text-blue-500 hover:underline"> S'inscrire</a>
//         </p>
//         </div>

//         <div className='flex flex-col items-center justify-center mt-20'>
//           <Button>Connexion</Button>
//         </div>


//     </>
//   )
// }

// export default ProLogin