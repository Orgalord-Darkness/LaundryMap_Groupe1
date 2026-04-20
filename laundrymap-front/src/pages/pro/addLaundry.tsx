import { useEffect, useState, useRef } from 'react'
import { RedirectDialog } from "@/components/ui/RedirectDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import CardMachine from '@/components/ui/cardMachine'
import AddMachineModal from '@/components/ui/addMachineModal'
import { CheckboxGroup } from '@/components/ui/checkboxGroupEdit'
import CarouselWithThumbs from '@/components/ui/carouselImage'
import WeekSchedulePicker, { type WeekSchedule, DEFAULT_WEEK_SCHEDULE, type DayKey } from '@/components/ui/timePicker'
import type { Machine } from '@/components/utils/laundry'
import { useNavigate } from 'react-router-dom'
import axios from 'axios' 

function AddLaundry() {

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/addLaundry`

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const api = axios.create({
      baseURL: `${API_BASE}/api/v1/laverie`,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
  })

  api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token")
      if (token) {
          config.headers.Authorization = `Bearer ${token}`
      }
      return config
  })

  // Infos Laverie 
  const [logo, setLogo] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [name, setName] = useState("");
  const [rue, setRue] = useState("");
  const [adress, setAdress] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [wilineCode, setWilineCode] = useState("");
  const [wilineLoading, setWilineLoading]   = useState(false)
  const [wilineError, setWilineError]       = useState<string | null>(null)
  const [machines, setMachines] = useState<Machine[]>([]) // state pour stocker les machines ajoutées via la modale
  const [contactEmail, setContactEmail] = useState("")

  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  // selectedMachines non utilisé dans addLaundry (les machines Wi-Line vont dans machines[])
  
  // const [allServices, setAllServices]   = useState<{ id: number; nom: string }[]>([])
  // const [allPaiements, setAllPaiements] = useState<{ id: number; nom: string }[]>([])

  const [week, setWeek] = useState<WeekSchedule>(DEFAULT_WEEK_SCHEDULE); // Horaires / Timepicker

  // États feedback API
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [redirectOpen, setRedirectOpen] = useState(false)

  // Aperçu du logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const logoUrlRef   = useRef<string | null>(null)

  const navigate = useNavigate()

  const [errors, setErrors] = useState({
    name: "",
    rue: "",
    adress: "", 
    codePostal: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
  });
  // ─── Utilitaires ─────────────────────────────────────────────────────────
  
  const emptyDay = () => ({
      morning:   { start: "", end: "" },
      afternoon: { start: "", end: "" },
  })

  function parseCapacite(typeName: string): number | null {
      const match = typeName?.match(/(\d+)\s*kg/i)
      return match ? parseInt(match[1]) : null
  }

  // ─── Import Wi-Line ───────────────────────────────────────────────────────

  const handleWilineImport = async () => {
      if (!wilineCode.trim()) return
      setWilineLoading(true)
      setWilineError(null)
      try {
          const res = await api.get(`/wiline-data?serial=${encodeURIComponent(wilineCode.trim())}`)
          const d = res.data

          // Adresse : "4 Boulevard Napoléon Premier" → adresse="4", rue="Boulevard Napoléon Premier"
          if (d.address) {
              const parts = d.address.split(' ')
              setAdress(parts[0] ?? '')
              setRue(parts.slice(1).join(' '))
          }
          if (d.postal_code) setCodePostal(String(d.postal_code))
          if (d.city)        setCity(d.city)
          if (d.country)     setCountry(d.country)

          // Machines (WASH, DRY, PRODUCTS) → converties au format Machine[] du formulaire
          const categoryFilter = ['WASH', 'DRY', 'PRODUCTS']
          if (Array.isArray(d.machines)) {
              const imported = d.machines
                  .filter((m: any) => categoryFilter.includes(m.category_text))
                  .map((m: any) => ({
                      name:      m.type_name || 'Équipement',
                      capacity:  parseCapacite(m.type_name) ?? 0,
                      duration:  m.duration > 0 ? Math.round(m.duration / 60) : 0,
                      price:     m.price    > 0 ? m.price / 100               : 0,
                      available: true,
                  }))
              setMachines(imported)
          }

          // Horaires (Wi-Line utilise des clés anglaises, dont "thuesday" avec une faute de frappe)
          const dayMap: Record<string, DayKey> = {
              monday:    'lundi',
              thuesday:  'mardi',
              wednesday: 'mercredi',
              thursday:  'jeudi',
              friday:    'vendredi',
              saturday:  'samedi',
              sunday:    'dimanche',
          }
          if (d.opening_hours) {
              const newWeek: WeekSchedule = {
                  lundi:    emptyDay(), mardi:    emptyDay(), mercredi: emptyDay(),
                  jeudi:    emptyDay(), vendredi: emptyDay(), samedi:   emptyDay(), dimanche: emptyDay(),
              }
              for (const [engDay, slots] of Object.entries(d.opening_hours)) {
                  const frDay = dayMap[engDay]
                  if (!frDay || !Array.isArray(slots) || slots.length === 0) continue
                  newWeek[frDay].morning = { start: (slots as any[])[0]?.open ?? '', end: (slots as any[])[0]?.close ?? '' }
                  if ((slots as any[]).length > 1) {
                      newWeek[frDay].afternoon = { start: (slots as any[])[1].open, end: (slots as any[])[1].close }
                  }
              }
              setWeek(newWeek)
          }
      } catch (err: any) {
          setWilineError(err?.response?.data?.message || 'Erreur lors de la récupération des données Wi-Line.')
      } finally {
          setWilineLoading(false)
      }
  }
  // Validation Front du formulaire
  const validateForm = (): boolean => {
    const newErrors = {
      name:       !name   ? "Le nom de la laverie est requis": "",
      rue:        !rue    ? "La rue est requise"   : "",
      adress:     !adress     ? "L'adresse est requise"     : "",  
      codePostal: !codePostal ? "Le code postal est requis" : "",
      city:       !city       ? "La ville est requise"      : "",
      country:    !country    ? "Le pays est requis"        : "",
      latitude:   latitude === "" ? "La latitude est requise"      : "",
      longitude:  longitude === "" ? "La longitude est requise"    : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((event) => event === "");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log(logo, images); 
    event.preventDefault();
    setApiError("")
    setSuccess("")
   
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setApiError("Vous devez être connecté pour ajouter une laverie.")
      return
    }



    const formData = new FormData();

    formData.append("name", name);
    formData.append("rue", rue);
    formData.append("adress", adress);
    formData.append("codePostal", codePostal);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("latitude", String(latitude));
    formData.append("longitude", String(longitude));
    formData.append("description", description);
    formData.append("contact_email", contactEmail);
    formData.append("wilineCode", wilineCode);
    formData.append("equipment", JSON.stringify(selectedEquipments))
    formData.append("paymentMethods", JSON.stringify(selectedPayments))
    formData.append("weekSchedule", JSON.stringify(week))
    formData.append("machines", JSON.stringify(machines))
 


    if (logo) { 
      formData.append("logo", logo); 
    }

    if (images) {
      Array.from(images).forEach((img) => formData.append("images[]", img));
    }


    setLoading(true);

    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    .then(async (response) => {
        const data = await response.json()
        if (response.ok) {
          setSuccess("Laverie ajoutée avec succès !")
          setRedirectOpen(true)
        } else {
          setApiError(data.message ?? "Une erreur est survenue.")
        }
      })
      .catch(() => {
        setApiError("Erreur réseau. Veuillez réessayer.")
      })
      .finally(() => {
        setLoading(false)
      })
  };

  // Cleanup uniquement au démontage — évite la révocation prématurée en React Strict Mode
  useEffect(() => {
    return () => { if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current) }
  }, [])




  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Ajouter une laverie</h1>
        <p className="flex flex-col items-center justify-center text-gray-500">Créer une laverie & ajoutez ses informations</p>

        
        {/* Aperçu du logo */}
        {logoPreview && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <img
              src={logoPreview}
              alt="Aperçu du logo"
              className="w-24 h-24 object-contain rounded-xl border border-gray-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current)
                logoUrlRef.current = null
                setLogoPreview(null)
                setLogo(null)
                if (logoInputRef.current) logoInputRef.current.value = ""
              }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="logo">Logo :<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="logo" ref={logoInputRef} type="file" accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              setLogo(file)
              if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current)
              const newUrl = file ? URL.createObjectURL(file) : null
              logoUrlRef.current = newUrl
              setLogoPreview(newUrl)
            }}
          />
          <FieldDescription>Selectionner un logo.</FieldDescription>
        </Field>


        <div className='my-5'>
          <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Galerie d'images</h1>
          <p className="flex flex-col items-center justify-center text-gray-500 mb-3">Vous pouvez ajouter plusieurs images de votre laverie</p>
          {images && <CarouselWithThumbs files={images} />}
        </div>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <Input id="imagesLaundry" type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
          <FieldDescription>Selectionnez des images pour vôtre laverie.</FieldDescription>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-10'>
          <FieldLabel htmlFor="input-field-name">Nom de la laverie<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-name" type="text" placeholder="Nom de vôtre laverie" value={name} onChange={(e) => setName(e.target.value)} className='h-11' aria-label='Nom de la laverie'/>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-email">Email de contact</FieldLabel>
          <Input id="input-field-email" type="email" placeholder="contact@exemple.fr" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className='h-11' />
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-rue">Rue<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-rue" type="text" placeholder="Ex : 12" value={rue} onChange={(e) => setRue(e.target.value)} className='h-11'/>
          {errors.rue && <p className="text-red-500 text-sm mt-1">{errors.rue}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-adress">Adresse<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-adress" type="text" placeholder="Ex : rue de la Paix" value={adress} onChange={(e) => setAdress(e.target.value)} className='h-11'/>
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

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-latitude">Latitude<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-latitude" type="number" step="any" placeholder="Latitude" value={latitude} 
          onChange={(e) => setLatitude(e.target.value === "" ? "" : parseFloat(e.target.value)) } className='h-11'/>
          {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-longitude">Longitude<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-longitude" type="number" step="any" placeholder="Longitude" value={longitude} 
          onChange={(e) => setLongitude(e.target.value === "" ? "" : parseFloat(e.target.value)) } className='h-11'/>
          {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
        </Field>


        <Field className="w-85 h-64 mt-5">
          <FieldLabel htmlFor="textarea-description">Description</FieldLabel>
          <FieldDescription>Entrer votre description ci-dessous.</FieldDescription>
          <Textarea id="textarea-description" placeholder="Ecrivez une description pour vôtre laverie." className='h-32' value={description}
          onChange={(e) => setDescription(e.target.value)} />
        </Field>


         {/* Wi-Line */}
            <Field className="w-85 m-auto mt-10">
                <FieldLabel htmlFor="wilineCode">Code Wi-Line</FieldLabel>
                <FieldDescription>
                    Numéro de série de votre centrale Wi-Line. Cliquez sur "Importer" pour pré-remplir automatiquement l'adresse, les machines et les horaires.
                </FieldDescription>
                <div className="flex gap-2 w-full">
                    <Input
                        id="wilineCode"
                        type="text"
                        value={wilineCode}
                        onChange={e => setWilineCode(e.target.value)}
                        className="h-11 flex-1"
                        placeholder="ex : 23128C02604C1521"
                    />
                    <Button
                        type="button"
                        onClick={handleWilineImport}
                        disabled={!wilineCode.trim() || wilineLoading}
                        className="h-11 whitespace-nowrap"
                    >
                        {wilineLoading ? 'Chargement…' : 'Importer'}
                    </Button>
                </div>
                {wilineError && (
                    <p className="text-red-500 text-xs mt-1">{wilineError}</p>
                )}
            </Field>

        {/* Ajout Machines dynamiques pour une laverie  */}
        <div className="my-5">
          <h2 className="flex flex-col font-bold mt-6 items-center justify-center text-xl">
            Machines
          </h2>
          <div className="mt-4">
            {machines.map((machine, index) => (
              <CardMachine
                key={index}
                name={machine.name}
                capacity={machine.capacity}
                duration={machine.duration}
                price={machine.price}
                available={machine.available}
              />
            ))}
          </div>
          <AddMachineModal onAdd={(machine: any) => setMachines((prev) => [...prev, machine])} />
        </div> 

        {/* Liste des équipements & méthodes de paiement hardcodés, a voir pour les récupérer de la base de données a l'avenir */}
        <CheckboxGroup
          title="Équipements disponibles"
          options={[
            { value: 'Wi-Fi',                  label: 'Wi-Fi'                  },
            { value: 'Table',                  label: 'Table'       },
            { value: 'Distributeur de lessive',label: 'Distributeur de lessive'},
            { value: 'Parking',                label: 'Parking'                },
            { value: 'Distributeur de snack',  label: 'Distributeur de snack'  },
          ]}
          disabled={false}
          value={selectedEquipments}
          onChange={setSelectedEquipments}
        />


        <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
          <WeekSchedulePicker value={week} onChange={setWeek} />
        </div>


        <CheckboxGroup
          title="Moyens de paiement acceptés"
          options={[
            { value: 'Carte Bleue',    label: 'Carte Bleue'    },
            { value: 'Carte Fidélité', label: 'Carte Fidélité' },
            { value: 'Pièces',         label: 'Pièces'         },
            { value: 'Billet',         label: 'Billets'        },
          ]} 
          disabled={false}
          value={selectedPayments}
          onChange={setSelectedPayments}
        /> 
    
        
        {apiError && <p className="text-red-500 text-sm mt-4 font-semibold">{apiError}</p>}
        {success  && <p className="text-green-600 text-sm mt-4 font-semibold">{success}</p>}

        <div className='flex flex-col items-center justify-center my-12'>
          <Button type="submit" disabled={loading}>
            {loading ? "Envoi en cours..." : "Ajouter une laverie"}
          </Button>
        </div>

        <RedirectDialog
          open={redirectOpen}
          title="Laverie ajoutée !"
          message="Laverie ajoutée avec succès."
          destinationLabel="votre tableau de bord"
          duration={1500}
          onNavigate={() => navigate('/pro/dashboard')}
        />
      </form>
    </>
  );
}

export default AddLaundry;