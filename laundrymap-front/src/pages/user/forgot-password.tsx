import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/mot_de_passe/oublie`, { email });
      setMessage(response.data.message || "Token de réinitialisation généré.");
      setError("");
      if (response.data.reset_token) {
        setMessage(`Token généré: ${response.data.reset_token}. Copiez-le pour réinitialiser le mot de passe.`);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Impossible d'envoyer le mail de réinitialisation.");
      setMessage("");
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 mt-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-semibold mb-4">Mot de passe oublié</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Recevoir un token</button>
      </form>
      {message && <p className="text-green-600 mt-3">{message}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
      <Link to="/user/login" className="text-sm text-blue-600 underline mt-3 block">Retour connexion</Link>
    </div>
  );
}
