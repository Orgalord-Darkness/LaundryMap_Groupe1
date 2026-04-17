import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"

export default function TechnicalDetailsForm() {
    // État local pour gérer les champs du formulaire
    const [formData, setFormData] = useState({
        wiLineReference: '',
        type: '',
        capacite: '',
        tarif: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Données techniques envoyées :", formData)
        // Ici, tu appelles ta fonction de sauvegarde ou ton API
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
                Détails Techniques
            </h2>

            <div className="space-y-4">
                {/* Référence Wi-Line */}
                <Field>
                    <FieldLabel>Référence ligne Wi-Line</FieldLabel>
                    <Input 
                        name="wiLineReference"
                        placeholder="Ex: WL-2026-X"
                        value={formData.wiLineReference}
                        onChange={handleChange}
                    />
                </Field>

                {/* Type de machine */}
                <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Input 
                        name="type"
                        placeholder="Ex: Machine à laver, Sèche-linge"
                        value={formData.type}
                        onChange={handleChange}
                    />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    {/* Capacité */}
                    <Field>
                        <FieldLabel>Capacité (kg)</FieldLabel>
                        <Input 
                            type="number"
                            name="capacite"
                            placeholder="7"
                            value={formData.capacite}
                            onChange={handleChange}
                        />
                    </Field>

                    {/* Tarif */}
                    <Field>
                        <FieldLabel>Tarif (€)</FieldLabel>
                        <Input 
                            type="number"
                            step="0.10"
                            name="tarif"
                            placeholder="5.50"
                            value={formData.tarif}
                            onChange={handleChange}
                        />
                    </Field>
                </div>
            </div>

            <Button type="submit" className="w-full">
                Enregistrer les détails
            </Button>
        </form>
    )
}