import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Token de réinitialisation manquant.");
      return;
    }

    if (password !== confirmation) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/mot_de_passe/reinitialisation`, {
        reset_token: token,
        mot_de_passe: password,
        confirmation_mot_de_passe: confirmation,
      });
      setMessage(response.data.message || "Mot de passe réinitialisé.");
      setError("");
      navigate("/user/login");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Impossible de réinitialiser le mot de passe.");
      setMessage("");
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 mt-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-semibold mb-4">Réinitialisation du mot de passe</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Confirmation du mot de passe"
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Réinitialiser</button>
      </form>
      {message && <p className="text-green-600 mt-3">{message}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
      <Link to="/user/login" className="text-sm text-blue-600 underline mt-3 block">Retour connexion</Link>
    </div>
  );
}
