import { useState } from "react";


const EQUIPEMENT_ENUM = {
  MACHINE_A_LAVER: "machine_a_laver",
  SECHE_LINGE:     "seche_linge",
  AUTRE:           "autre",
} as const;

type EquipementEnum = typeof EQUIPEMENT_ENUM[keyof typeof EQUIPEMENT_ENUM];

export interface EquipementFormData {
  nom:      string;
  type:     EquipementEnum;
  capacite: number | null;
  tarif:    number | null;
  duree:    number | null;
}

/** Labels affichés dans le select */
export const EQUIPEMENT_LABELS: Record<EquipementEnum, string> = {
  [EQUIPEMENT_ENUM.MACHINE_A_LAVER]: "Machine à laver",
  [EQUIPEMENT_ENUM.SECHE_LINGE]:     "Sèche-linge",
  [EQUIPEMENT_ENUM.AUTRE]:           "Autre",
};



interface AddMachineModalProps {
  onAdd: (data: EquipementFormData) => void;
}




const INITIAL_FORM: EquipementFormData = {
  nom:      "",
  type:     EQUIPEMENT_ENUM.MACHINE_A_LAVER,
  capacite: null,
  tarif:    null,
  duree:    null,
};

const TYPE_CONFIG: Record<EquipementEnum, { showCapacite: boolean; showDuree: boolean }> = {
  [EQUIPEMENT_ENUM.MACHINE_A_LAVER]: { showCapacite: true,  showDuree: true  },
  [EQUIPEMENT_ENUM.SECHE_LINGE]:     { showCapacite: true,  showDuree: true  },
  [EQUIPEMENT_ENUM.AUTRE]:           { showCapacite: false, showDuree: false },
};

type FormErrors = Partial<Record<keyof EquipementFormData, string>>;

export default function AddMachineModal({ onAdd }: AddMachineModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form,   setForm]   = useState<EquipementFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const config = TYPE_CONFIG[form.type];

  const open  = () => { setForm(INITIAL_FORM); setErrors({}); setIsOpen(true); };
  const close = () => setIsOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nom.trim()) next.nom = "Le nom est requis.";
    if (config.showCapacite && form.capacite !== null && form.capacite <= 0)
      next.capacite = "La capacité doit être supérieure à 0.";
    if (config.showDuree && form.duree !== null && form.duree <= 0)
      next.duree = "La durée doit être supérieure à 0.";
    if (form.tarif !== null && form.tarif < 0)
      next.tarif = "Le tarif ne peut pas être négatif.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd(form);
    close();
  };

  const inputClass = (field: keyof FormErrors) =>
    [
      "w-full rounded-xl border px-3 py-2.5 text-sm text-gray-800",
      "placeholder:text-gray-400 bg-gray-50",
      "focus:outline-none focus:ring-2 focus:ring-gray-300 transition",
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200",
    ].join(" ");





  return (
    <>
      <button
        onClick={open}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-150 shadow-sm"
        aria-label="Ajouter un équipement"
      >
        Ajouter une machine
        <span className="flex items-center justify-center w-5 h-5 rounded border border-gray-400 text-gray-500 text-sm leading-none select-none" aria-hidden="true">+</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden="true" />

          <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl px-5 pt-5 pb-8 sm:pb-6">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                    <circle cx="12" cy="13" r="4.5" /><circle cx="12" cy="13" r="2" />
                    <rect x="5" y="6" width="3" height="1.5" rx="0.75" fill="currentColor" stroke="none" />
                    <rect x="9.5" y="6" width="3" height="1.5" rx="0.75" fill="currentColor" stroke="none" />
                    <line x1="2" y1="9.5" x2="22" y2="9.5" strokeWidth="1" />
                  </svg>
                </div>
                <h2 id="modal-title" className="text-base font-semibold text-gray-900">Ajouter un équipement</h2>
              </div>
              <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Fermer">✕</button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              {/* nom */}
              <div>
                <label htmlFor="nom" className="block text-xs font-medium text-gray-600 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input id="nom" name="nom" type="text" value={form.nom} onChange={handleChange} placeholder="Ex : Machine n°3" className={inputClass("nom")} />
                {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
              </div>

              {/* type */}
              <div>
                <label htmlFor="type" className="block text-xs font-medium text-gray-600 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select id="type" name="type" value={form.type} onChange={handleChange} className={inputClass("type") + " appearance-none cursor-pointer"}>
                  {Object.values(EQUIPEMENT_ENUM).map((val) => (
                    <option key={val} value={val}>{EQUIPEMENT_LABELS[val]}</option>
                  ))}
                </select>
              </div>

              {/* capacite + duree */}
              {(config.showCapacite || config.showDuree) && (
                <div className="grid grid-cols-2 gap-3">
                  {config.showCapacite && (
                    <div>
                      <label htmlFor="capacite" className="block text-xs font-medium text-gray-600 mb-1">Capacité (Kg)</label>
                      <input id="capacite" name="capacite" type="number" min={1} value={form.capacite ?? ""} onChange={handleChange} placeholder="—" className={inputClass("capacite")} />
                      {errors.capacite && <p className="mt-1 text-xs text-red-500">{errors.capacite}</p>}
                    </div>
                  )}
                  {config.showDuree && (
                    <div>
                      <label htmlFor="duree" className="block text-xs font-medium text-gray-600 mb-1">Programme (min)</label>
                      <input id="duree" name="duree" type="number" min={1} value={form.duree ?? ""} onChange={handleChange} placeholder="—" className={inputClass("duree")} />
                      {errors.duree && <p className="mt-1 text-xs text-red-500">{errors.duree}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* tarif */}
              <div>
                <label htmlFor="tarif" className="block text-xs font-medium text-gray-600 mb-1">Tarif (€)</label>
                <div className="relative">
                  <input id="tarif" name="tarif" type="number" min={0} step={0.5} value={form.tarif ?? ""} onChange={handleChange} placeholder="—" className={inputClass("tarif") + " pr-8"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">€</span>
                </div>
                {errors.tarif && <p className="mt-1 text-xs text-red-500">{errors.tarif}</p>}
              </div>

              <div className="border-t border-gray-100" />

              <div className="flex gap-3"> 
                <button type="button" onClick={close} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-200 active:scale-95 transition-all duration-150 cursor-pointer">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-blue-800 active:scale-95 transition-all duration-150 cursor-pointer">Ajouter</button> 
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}