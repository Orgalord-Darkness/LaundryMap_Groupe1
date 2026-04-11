import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Verification() {
  const { token } = useParams();
  const [message, setMessage] = useState("Vérification en cours...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/validation/${token}`)
      .then((response) => {
        setMessage(response.data.message || "E-mail confirmé avec succès.");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erreur lors de la validation de votre email.");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-md p-6 mt-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-semibold mb-4">Confirmation email</h1>
      {error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="text-green-600">{message}</div>
      )}
      <Link to="/user/login" className="text-blue-600 underline mt-4 inline-block">Retour à la connexion</Link>
    </div>
  );
}
