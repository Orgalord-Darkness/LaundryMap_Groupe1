import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import CardMachine from '@/components/ui/cardMachine'
import  EquipementFormData from '@/components/ui/addMachineModal'
import { CheckboxGroup } from '@/components/ui/checkboxGroup'
import CarouselWithThumbs from '@/components/ui/carouselImage'
import WeekSchedulePicker, { type WeekSchedule, DEFAULT_WEEK_SCHEDULE } from '@/components/ui/timePicker'

function AddLaundry() {

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/pro/addLaundry`

  // Infos Laverie 
  const [logo, setLogo] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [name, setName] = useState("");
  const [rue, setRue] = useState("");
  const [adress, setAdress] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [wilineCode, setWilineCode] = useState("");

  const [selectedEquipments, setSelectedEquipments] = useState<[]>([]); // Equipements disponibles
  const [selectedPayments, setSelectedPayments] = useState<[]>([]);

  const [week, setWeek] = useState<WeekSchedule>(DEFAULT_WEEK_SCHEDULE); //Horaires / Timepicker

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

  // Validation Front du formulaire
  const validateForm = (): boolean => {
    const newErrors = {
      name:       !name   ? "Le nom de la laverie est requis": "",
      rue:        !rue    ? "La rue est requise"   : "",
      adress:     !adress     ? "L'adresse est requise"     : "",  
      codePostal: !codePostal ? "Le code postal est requis" : "",
      city:       !city       ? "La ville est requise"      : "",
      country:    !country    ? "Le pays est requis"        : "",
      latitude:   !latitude   ? "La latitude est requise"   : "",
      longitude:  !longitude  ? "La longitude est requise"  : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((event) => event === "");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   
    if (!validateForm()) {
      return;
    }

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        rue,
        adress,
        codePostal,
        city,
        country,
        latitude,
        longitude,
        description,
        wilineCode,
        equipment: selectedEquipments,
        paymentMethods: selectedPayments,
        weekSchedule: week, // Horaires / Timepicker
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          console.log("Laverie ajoutée avec succès !", data);
          // Réinitialise les états ou redirige
        } else {
          console.error("Erreur :", data.message);
        }
      })
      .catch((error) => {
        console.error("Erreur réseau :", error);
      });
  };






  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Ajouter une laverie</h1>
        <p className="flex flex-col items-center justify-center text-gray-500">Créer une laverie & ajoutez ses informations</p>

        {/* {Error && <p className="text-red-500 text-sm mt-4 font-semibold">{Error}</p>} */}
        {/* {success  && <p className="text-green-600 text-sm mt-4 font-semibold">{success}</p>} */}


        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="logo">Logo :<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="logo" type="file" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
          <FieldDescription>Selectionner un logo.</FieldDescription>
        </Field>

        <div className='my-5'>
          <h1 className='flex flex-col font-bold mt-10 items-center justify-center text-2xl'>Galerie d'images</h1>
          <p className="flex flex-col items-center justify-center text-gray-500 mb-3">Vous pouvez ajouter plusieurs images de votre laverie</p>
          <CarouselWithThumbs  />
        </div>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <Input id="imagesLaundry" type="file" multiple onChange={(e) => setImages(e.target.files)} />
          <FieldDescription>Selectionnez des images pour vôtre laverie.</FieldDescription>
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-10' aria-label='Nom de la laverie'>
          <FieldLabel htmlFor="input-field-name">Nom de la laverie<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-name" type="text" placeholder="Nom de vôtre laverie" value={name} onChange={(e) => setName(e.target.value)} className='h-11' aria-label='Nom de la laverie'/>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
          <Input id="input-field-latitude" type="number" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className='h-11'/>
          {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
        </Field>

        <Field className='w-85 m-auto items-center justify-center mt-5'>
          <FieldLabel htmlFor="input-field-longitude">Longitude<span className='text-orange-600'>*</span></FieldLabel>
          <Input id="input-field-longitude" type="number" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className='h-11'/>
          {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
        </Field>


        <Field className="w-85 h-64 mt-5">
          <FieldLabel htmlFor="textarea-description">Description</FieldLabel>
          <FieldDescription>Entrer votre description ci-dessous.</FieldDescription>
          <Textarea id="textarea-description" placeholder="Ecrivez une description pour vôtre laverie." className='h-32' value={description}
          onChange={(e) => setDescription(e.target.value)} />
        </Field>


        <Field className='w-85 m-auto items-center justify-center mt-0'>
          <FieldLabel htmlFor="wilineCode">Code Wi-Line</FieldLabel>
          <FieldDescription>Un code vous ait fourni si votre laverie dispose d'une centrale de paiement Wi-Line</FieldDescription>
          <Input id="wilineCode" type="text" placeholder="Code Wi-Line" value={wilineCode} onChange={(e) => setWilineCode(e.target.value)} className='h-11'/>
          {/* {errors.wilineCode && <p className="text-red-500 text-sm mt-1">{errors.wilineCode}</p>} */}
        </Field>



        <div className='my-5'>
          <div className='mt-4'> 
            <CardMachine name="Machine à laver" capacity={12} duration={45} price={3} available={true} /> 
            <CardMachine name="Machine à laver" capacity={12} duration={45} price={3} available={true} /> {/* // false → badge rouge "Occupée" */}
          </div>
          <EquipementFormData onAdd={() => {}}/>    {/* Modal d'ajout */}
        </div>


        <CheckboxGroup
          title="Equipements disponibles"
          options={[
            { value: 'Wi-fi', label: 'Wi-Fi' },
            { value: 'Tables & chaises', label: 'Tables & chaises' },
            { value: 'Distributeur de savon', label: 'Distributeur de savon' },
            { value: 'Fer a repasser', label: 'Fer a repasser' },
          ]} 
          // selected={selectedEquipments} onChange={setSelectedEquipments}
        />


        <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
          <WeekSchedulePicker value={week} onChange={setWeek} />
          {/* <button onClick={save}>Enregistrer</button> */}
        </div>


        <CheckboxGroup
          title="Moyens de paiement acceptés"
          options={[
            { value: 'carte-bleu', label: 'Carte Bleu' },
            { value: 'carte-fidelite', label: 'Carte Fidélité' },
            { value: 'pieces', label: 'Pièces' },
            { value: 'billets', label: 'Billets' },
          ]} 
          // selected={selectedPayments} onChange={setSelectedPayments}
        />
    
    

        <div className='flex flex-col items-center justify-center my-12'>
          <Button type="submit">Ajouter une laverie</Button>
        </div>

      </form>
    </>
  );
}

export default AddLaundry;