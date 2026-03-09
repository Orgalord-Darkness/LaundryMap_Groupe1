import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function ProInscription() {

  return (
    <>
      <h1 className='flex flex-col font-bold mt-10 items-center justify-center'>Inscription</h1>
      <p className="flex flex-col items-center justify-center text-gray-500">Créer un compte</p>
      
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Input placeholder="Email" type="email" className="mb-4 w-85 h-11" />
        <Input placeholder="Mot de passe" type="password" className="mb-4 w-85 h-11" />
        <Input placeholder="Confirmer le mot de passe" type="password" className="mb-4 w-85 h-11" />
        <Button>Inscription</Button>
      </div>

    </>
  )
}

export default ProInscription