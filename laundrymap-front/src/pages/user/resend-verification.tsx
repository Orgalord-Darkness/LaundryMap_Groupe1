import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/resend-validation`, { email });
      setMessage(response.data.message || "E-mail de validation renvoyé.");
      setError("");

      if (response.data.verification_url) {
        setMessage(`E-mail de validation renvoyé. ${response.data.verification_url}`);
      }

      setTimeout(() => {
        navigate(`/user/login`);
      }, 4000);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Impossible de renvoyer le mail de validation.");
      setMessage("");
    }
  };

  return (
    <div className="mx-auto max-w-md mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Renvoyer l'email de validation</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Envoyer</button>
      </form>
      {message && <p className="text-green-600 mt-3">{message}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
