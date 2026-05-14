import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import CardMachine from '@/components/ui/cardMachine'
import AddMachineModal from '@/components/ui/addMachineModal'
import { CheckboxGroup } from '@/components/ui/checkboxGroupEdit'
import UppyImageUploader from '@/components/ui/UppyImageUploader'
import WeekSchedulePicker, { type WeekSchedule, DEFAULT_WEEK_SCHEDULE, type DayKey } from '@/components/ui/timePicker'
import type { Machine } from '@/components/utils/laundry'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/lib/apiClient'

function AddLaundry() {

  const { t } = useTranslation()

  // Infos Laverie
  const [logoFiles,    setLogoFiles   ] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [name, setName] = useState("");
  const [adress, setAdress] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [wilineCode, setWilineCode] = useState("");
  const [wilineLoading, setWilineLoading]   = useState(false)
  const [wilineError, setWilineError]       = useState<string | null>(null)
  const [machines, setMachines] = useState<Machine[]>([])
  const [contactEmail, setContactEmail] = useState("")

  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  // const [allServices, setAllServices]   = useState<{ id: number; nom: string }[]>([])
  // const [allPaiements, setAllPaiements] = useState<{ id: number; nom: string }[]>([])

  const [week, setWeek] = useState<WeekSchedule>(DEFAULT_WEEK_SCHEDULE);

  // États feedback API
  const [apiError, setApiError] = useState("")
  const [geoErreur, setGeoErreur] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const navigate = useNavigate()

  const [errors, setErrors] = useState({
    name: "",
    adress: "",
    codePostal: "",
    city: "",
    country: "",
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
          const res = await apiClient.get(`/laverie/wiline-data?serial=${encodeURIComponent(wilineCode.trim())}`)
          const d = res.data

          if (d.name)        setName(d.name)
          if (d.pub)         setDescription(d.pub)
          if (d.address)     setAdress(d.address)
          if (d.postal_code) setCodePostal(String(d.postal_code))
          if (d.city)        setCity(d.city)
          if (d.country)     setCountry(d.country)

          if (d.opening_hours) {
            if (d.opening_hours.monday)    setWeek((w) => ({ ...w, lundi:    { morning: { start: d.opening_hours.monday[0]?.open ?? '', end: d.opening_hours.monday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.monday[1]?.open ?? '', end: d.opening_hours.monday[1]?.close ?? '' } } }))
            if (d.opening_hours.tuesday)   setWeek((w) => ({ ...w, mardi:    { morning: { start: d.opening_hours.tuesday[0]?.open ?? '', end: d.opening_hours.tuesday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.tuesday[1]?.open ?? '', end: d.opening_hours.tuesday[1]?.close ?? '' } } }))
            if (d.opening_hours.wednesday) setWeek((w) => ({ ...w, mercredi: { morning: { start: d.opening_hours.wednesday[0]?.open ?? '', end: d.opening_hours.wednesday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.wednesday[1]?.open ?? '', end: d.opening_hours.wednesday[1]?.close ?? '' } } }))
            if (d.opening_hours.thursday)  setWeek((w) => ({ ...w, jeudi:    { morning: { start: d.opening_hours.thursday[0]?.open ?? '', end: d.opening_hours.thursday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.thursday[1]?.open ?? '', end: d.opening_hours.thursday[1]?.close ?? '' } } }))
            if (d.opening_hours.friday)    setWeek((w) => ({ ...w, vendredi: { morning: { start: d.opening_hours.friday[0]?.open ?? '', end: d.opening_hours.friday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.friday[1]?.open ?? '', end: d.opening_hours.friday[1]?.close ?? '' } } }))
            if (d.opening_hours.saturday)  setWeek((w) => ({ ...w, samedi:   { morning: { start: d.opening_hours.saturday[0]?.open ?? '', end: d.opening_hours.saturday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.saturday[1]?.open ?? '', end: d.opening_hours.saturday[1]?.close ?? '' } } }))
            if (d.opening_hours.sunday)    setWeek((w) => ({ ...w, dimanche: { morning: { start: d.opening_hours.sunday[0]?.open ?? '', end: d.opening_hours.sunday[0]?.close ?? '' }, afternoon: { start: d.opening_hours.sunday[1]?.open ?? '', end: d.opening_hours.sunday[1]?.close ?? '' } } }))
          }

          if (d.coin_accepted     === true) setSelectedPayments((prev) => [...prev, 'Pièces'])
          if (d.bill_accepted     === true) setSelectedPayments((prev) => [...prev, 'Billet'])
          if (d.card_accepted     === true) setSelectedPayments((prev) => [...prev, 'Carte Bleue'])
          if (d.fidelity_accepted === true) setSelectedPayments((prev) => [...prev, 'Carte Fidélité'])

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
          setWilineError(err?.response?.data?.message || t('laundry_form_wiline_fetch_error'))
      } finally {
          setWilineLoading(false)
      }
  }

  // Ordre de priorité pour le scroll : latitude/longitude pointent vers le champ adresse
  const fieldScrollOrder: { key: keyof typeof errors; refKey: string }[] = [
    { key: 'name',       refKey: 'name'      },
    { key: 'adress',     refKey: 'adress'    },
    { key: 'codePostal', refKey: 'codePostal'},
    { key: 'city',       refKey: 'city'      },
    { key: 'country',    refKey: 'country'   },
  ]

  // TODO(human): Implémentez la validation en utilisant t() pour les messages d'erreur.
  // Pour chaque champ obligatoire, retournez t('validation_*_required') si vide, sinon "".
  // Clés disponibles : validation_name_required, validation_address_required,
  // validation_postal_required, validation_city_required, validation_country_required
  const validateForm = () => {
    const newErrors = {
      name:       "",
      adress:     "",
      codePostal: "",
      city:       "",
      country:    "",
    }
    setErrors(newErrors)
    return { valid: Object.values(newErrors).every(e => e === ""), newErrors }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setApiError("")
    setGeoErreur("")
    setSuccess("")

    const { valid, newErrors } = validateForm()
    if (!valid) {
      const firstError = fieldScrollOrder.find(({ key }) => newErrors[key] !== "")
      if (firstError) {
        fieldRefs.current[firstError.refKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("adress", adress);
    formData.append("codePostal", codePostal);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("description", description);
    formData.append("contact_email", contactEmail);
    formData.append("wilineCode", wilineCode);
    formData.append("equipment", JSON.stringify(selectedEquipments))
    formData.append("paymentMethods", JSON.stringify(selectedPayments))
    formData.append("weekSchedule", JSON.stringify(week))
    formData.append("machines", JSON.stringify(machines))

    if (logoFiles.length > 0) {
      formData.append("logo", logoFiles[0])
    }
    galleryFiles.forEach(file => formData.append("images[]", file))

    setLoading(true);

    apiClient.post('/professionnel/addLaundry', formData)
      .then((response) => {
        const data = response.data
        setSuccess(t('add_laundry_success'))
        void data
        navigate('/pro/dashboard')
      })
      .catch((err) => {
        const data = err?.response?.data
        setApiError(data?.message ?? t('search_error'))
        if (data?.errors?.geolocation) {
          setGeoErreur(data.errors.geolocation)
          fieldRefs.current['adress']?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          setApiError(t('add_laundry_network_error'))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>{t('add_laundry_title')}</h1>
        <p className="flex flex-col items-center justify-center text-gray-500">{t('add_laundry_subtitle')}</p>

        {/* Wi-Line */}
        <Field className="w-full max-w-md mx-auto mt-10" id='wiline-field'>
            <FieldLabel htmlFor="wilineCode">{t('laundry_form_wiline_label')}</FieldLabel>
            <FieldDescription>
                {t('laundry_form_wiline_description')}
            </FieldDescription>
            <div className="flex gap-2 mt-2 w-full">
                <Input
                    id="wilineCode"
                    type="text"
                    value={wilineCode}
                    onChange={e => setWilineCode(e.target.value)}
                    className="h-11 flex-1"
                    placeholder={t('laundry_form_wiline_placeholder')}
                />
                <Button
                    type="button"
                    onClick={handleWilineImport}
                    disabled={!wilineCode.trim() || wilineLoading}
                    className="h-11 whitespace-nowrap px-4 py-2"
                >
                    {wilineLoading ? t('laundry_form_wiline_loading') : t('laundry_form_wiline_import')}
                </Button>
            </div>
            {wilineError && (
                <p className="text-red-500 text-xs mt-1">{wilineError}</p>
            )}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5' id='logo-field'>
          <FieldLabel>{t('laundry_form_logo_label')}<span className='text-orange-600'>*</span></FieldLabel>
          <UppyImageUploader mode="logo" onFilesChange={setLogoFiles} />
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5' id='images-field'>
          <FieldLabel>{t('laundry_form_gallery_title')}</FieldLabel>
          <p className="text-sm text-gray-500 mb-2">{t('laundry_form_gallery_description')}</p>
          <UppyImageUploader mode="gallery" onFilesChange={setGalleryFiles} />
        </Field>

        <div ref={el => { fieldRefs.current.name = el }}>
          <Field className='w-85 m-auto items-center justify-center mt-10' id='name-field'>
            <FieldLabel htmlFor="input-field-name">{t('laundry_form_name_label')}<span className='text-orange-600'>*</span></FieldLabel>
            <Input id="input-field-name" type="text" placeholder={t('laundry_form_name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} className='h-11' aria-label={t('laundry_form_name_label')}/>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </Field>
        </div>

        <Field className='w-85 m-auto items-center justify-center mt-5' id='email-field'>
          <FieldLabel htmlFor="input-field-email">{t('laundry_form_email_label')}</FieldLabel>
          <Input id="input-field-email" type="email" placeholder={t('laundry_form_email_placeholder')} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className='h-11'/>
        </Field>

        <div ref={el => { fieldRefs.current.adress = el }}>
          <Field className='w-85 m-auto items-center justify-center mt-5' id='adress-field'>
            {geoErreur && <p className="text-red-500 text-sm mt-1">{geoErreur}</p>}
            <FieldLabel htmlFor="input-field-adress">{t('laundry_form_address_label')}<span className='text-orange-600'>*</span></FieldLabel>
            <Input id="input-field-adress" type="text" placeholder={t('laundry_form_address_placeholder')} value={adress} onChange={(e) => setAdress(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`}/>
            {errors.adress && <p className="text-red-500 text-sm mt-1">{errors.adress}</p>}
          </Field>
        </div>

        <div ref={el => { fieldRefs.current.codePostal = el }}>
          <Field className='w-85 m-auto items-center justify-center mt-5' id='zip-field'>
            <FieldLabel htmlFor="input-field-codePostal">{t('laundry_form_postal_label')}<span className='text-orange-600'>*</span></FieldLabel>
            <Input id="input-field-codePostal" type="text" placeholder={t('laundry_form_postal_label')} value={codePostal} onChange={(e) => setCodePostal(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`}/>
            {errors.codePostal && <p className="text-red-500 text-sm mt-1">{errors.codePostal}</p>}
          </Field>
        </div>

        <div ref={el => { fieldRefs.current.city = el }}>
          <Field className='w-85 m-auto items-center justify-center mt-5' id='city-field'>
            <FieldLabel htmlFor="input-field-city">{t('laundry_form_city_label')}<span className='text-orange-600'>*</span></FieldLabel>
            <Input id="input-field-city" type="text" placeholder={t('laundry_form_city_label')} value={city} onChange={(e) => setCity(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`}/>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </Field>
        </div>

        <div ref={el => { fieldRefs.current.country = el }}>
          <Field className='w-85 m-auto items-center justify-center mt-5' id='country-field'>
            <FieldLabel htmlFor="input-field-country">{t('laundry_form_country_label')}<span className='text-orange-600'>*</span></FieldLabel>
            <Input id="input-field-country" type="text" placeholder={t('laundry_form_country_label')} value={country} onChange={(e) => setCountry(e.target.value)} className={`h-11 ${geoErreur ? "border border-red-500" : ""}`}/>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </Field>
        </div>

        <Field className="w-85 h-64 mt-5" id='description-field'>
          <FieldLabel htmlFor="textarea-description">{t('laundry_form_description_label')}</FieldLabel>
          <FieldDescription>{t('laundry_form_description_hint')}</FieldDescription>
          <Textarea id="textarea-description" placeholder={t('laundry_form_description_placeholder')} className='h-32' value={description}
          onChange={(e) => setDescription(e.target.value)} />
        </Field>

        {/* Ajout Machines dynamiques pour une laverie */}
        <div className="my-5" id='machines-field'>
          <h2 className="flex flex-col font-bold mt-6 items-center justify-center text-xl">
            {t('laundry_form_machines_title')}
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
          title={t('laundry_form_equipments_title')}
          options={[
            { value: 'Wi-Fi',                  label: 'Wi-Fi'                   },
            { value: 'Table',                  label: 'Table'                   },
            { value: 'Distributeur de lessive',label: 'Distributeur de lessive' },
            { value: 'Parking',                label: 'Parking'                 },
            { value: 'Distributeur de snack',  label: 'Distributeur de snack'   },
          ]}
          disabled={false}
          value={selectedEquipments}
          onChange={setSelectedEquipments}
        />

        <div className="p-4 max-w-md mx-auto flex flex-col gap-4" id='schedule-field'>
          <WeekSchedulePicker value={week} onChange={setWeek} />
        </div>

        <CheckboxGroup
          title={t('laundry_form_payments_title')}
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
            {loading ? t('add_laundry_submitting') : t('add_laundry_submit')}
          </Button>
        </div>
      </form>
    </>
  );
}

export default AddLaundry;
