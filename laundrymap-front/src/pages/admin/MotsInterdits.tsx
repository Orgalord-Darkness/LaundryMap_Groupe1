import { useEffect, useState } from "react";
import axios from "axios";



interface MotInjurieux {
  id: number;
  label: string;
}



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Auth par cookie JWT
});



const motInjurieuxService = {
  // Récupère tous les mots interdits
  getAll: async (): Promise<MotInjurieux[]> => {
    const response = await api.get("/api/v1/admin/mots-interdits");
    return response.data;
  },

  // Ajoute un nouveau mot
  create: async (label: string): Promise<MotInjurieux> => {
    const response = await api.post("/api/v1/admin/mots-interdits", { label });
    return response.data;
  },

  // Supprime un mot par son id
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin/mots-interdits/${id}`);
  },
};



export default function MotsInterdits() {
  const [mots, setMots] = useState<MotInjurieux[]>([]);
  const [nouveauMot, setNouveauMot] = useState<string>("");
  const [recherche, setRecherche] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [ajoutLoading, setAjoutLoading] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  // Charge la liste au montage du composant
  useEffect(() => {
    chargerMots();
  }, []);

  // Efface les messages après 3 secondes
  useEffect(() => {
    if (erreur || succes) {
      const timer = setTimeout(() => {
        setErreur(null);
        setSucces(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [erreur, succes]);

  const chargerMots = async () => {
    try {
      setLoading(true);
      const data = await motInjurieuxService.getAll();
      // Tri alphabétique
      setMots(data.sort((a, b) => a.label.localeCompare(b.label)));
    } catch (err) {
      setErreur("Impossible de charger la liste des mots interdits.");
    } finally {
      setLoading(false);
    }
  };

  const handleAjouter = async () => {
    const label = nouveauMot.trim();

    if (!label) {
      setErreur("Veuillez saisir un mot.");
      return;
    }

    setAjoutLoading(true);
    setErreur(null);

    try {
      const motCree = await motInjurieuxService.create(label);
      // Ajout dans la liste et tri alphabétique
      setMots((prev) =>
        [...prev, motCree].sort((a, b) => a.label.localeCompare(b.label))
      );
      setNouveauMot("");
      setSucces(`Le mot "${motCree.label}" a été ajouté.`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErreur("Ce mot existe déjà dans la liste.");
      } else {
        setErreur("Erreur lors de l'ajout du mot.");
      }
    } finally {
      setAjoutLoading(false);
    }
  };

  const handleSupprimer = async (mot: MotInjurieux) => {
    // Confirmation avant suppression
    if (!window.confirm(`Supprimer le mot "${mot.label}" ?`)) return;

    try {
      await motInjurieuxService.delete(mot.id);
      setMots((prev) => prev.filter((m) => m.id !== mot.id));
      setSucces(`Le mot "${mot.label}" a été supprimé.`);
    } catch {
      setErreur("Erreur lors de la suppression du mot.");
    }
  };

  // Filtrage local par la recherche
  const motsFiltres = mots.filter((m) =>
    m.label.toLowerCase().includes(recherche.toLowerCase())
  );

  

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mots interdits</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez la liste des mots filtrés dans les avis et commentaires.
        </p>
      </div>

      {/* Messages de retour (succès / erreur) */}
      {succes && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {succes}
        </div>
      )}
      {erreur && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {erreur}
        </div>
      )}

      {/* Zone d'ajout d'un nouveau mot */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ajouter un mot interdit
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nouveauMot}
            onChange={(e) => setNouveauMot(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAjouter()}
            placeholder="Ex : insulte, gros mot..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAjouter}
            disabled={ajoutLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white text-sm font-medium px-4 py-2 rounded-lg
                       transition-colors duration-150 whitespace-nowrap"
          >
            {ajoutLoading ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </div>

      {/* Compteur + barre de recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <span className="text-sm text-muted-foreground">
          {mots.length} mot{mots.length !== 1 ? "s" : ""} au total
          {recherche && ` · ${motsFiltres.length} résultat${motsFiltres.length !== 1 ? "s" : ""}`}
        </span>
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un mot..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     w-full sm:w-56"
        />
      </div>

      {/* Liste des mots */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Chargement...
          </div>
        ) : motsFiltres.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            {recherche ? "Aucun mot ne correspond à votre recherche." : "Aucun mot interdit enregistré."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {motsFiltres.map((mot) => (
              <li
                key={mot.id}
                className="flex items-center justify-between px-4 py-3
                           hover:bg-gray-50 transition-colors duration-100"
              >
                <span className="text-sm text-gray-800 font-mono">{mot.label}</span>
                <button
                  onClick={() => handleSupprimer(mot)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium
                             px-2 py-1 rounded hover:bg-red-50 transition-colors duration-150"
                  title="Supprimer ce mot"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}