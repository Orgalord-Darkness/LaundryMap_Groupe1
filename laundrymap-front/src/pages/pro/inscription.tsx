import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

function ProInscription() {

  return (
    <>

      <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Inscription</h1>
      <p className="flex flex-col items-center justify-center text-gray-500 ">Créer un compte professionnel</p>
      
      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-lastname">Nom<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-lastname" type="text" placeholder="Nom" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-firstname">Prénom<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-firstname" type="text" placeholder="Prénom" className='h-11'/>
      </Field>


      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-email">Email <span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-email" type="email" placeholder="Email" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-password">Mot de passe <span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-password" type="password" placeholder="Mot de passe" className="h-11 "/>
        <FieldDescription>Choisissez un mot de passe fort & unique.</FieldDescription>
      </Field>

      <p className="flex flex-col items-center justify-center text-gray-500 mt-7">Informations entreprise</p>
      <div className="flex items-center mx-auto pb-3 w-55 border-b-2 border-gray-300"></div>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-companyName">Nom de l'entreprise<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-companyName" type="text" placeholder="Nom de l'entreprise" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-siren">Numéro de SIREN<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-siren" type="text" placeholder="Numéro de SIREN" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-adress">Adresse<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-adress" type="text" placeholder="Adresse" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-city">Ville<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-city" type="text" placeholder="Ville" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-country">Pays<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-country" type="text" placeholder="Pays" className='h-11'/>
      </Field>

      <Field className='w-85 m-auto items-center justify-center mt-5'>
        <FieldLabel htmlFor="input-field-codeApe">Code APE<span className='text-orange-600'>*</span></FieldLabel>
        <Input id="input-field-codeApe" type="text" placeholder="Code APE" className='h-11'/>
      </Field>


      <div className='flex flex-col items-center justify-center my-12'>
        <Button>Inscription</Button>
      </div>

    </>
  )
}

export default ProInscription