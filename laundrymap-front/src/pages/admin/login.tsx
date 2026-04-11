import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/components/context/AuthContext";
import axios from 'axios';
function AdminLogin() {
  
  const { login } = useAuth();
  
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/login_check`;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({ email: "", password: "" });

  // Validation côté client
  const validateForm = () => {
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {

      const response = await axios.post(url, {
        email,
        password
      }, {
        headers: {
          "Content-Type": "application/json",
        }
      })
      const data = response.data 

      if (data.errors) {
        Object.keys(data.errors).forEach((champ) => {
          setErrors((prev) => ({
            ...prev,
            [champ]: data.errors[champ],
          }));
        });
        return;
      }

      login(data.token);
      navigate("/admin/dashboard", { state: { popup: { title: "Bienvenue", content: "Connexion réussie", variant: "success" } } });
    }
  };

  return (
    <>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className="font-bold text-2xl mt-6">Connexion</h1>
        <p className="text-gray-500 text-center mt-2"> Se connecter en tant qu'administrateur </p>

        <Field className="w-11/12 max-w-md mt-16">
          <FieldLabel htmlFor="email">
            Email <span className="text-orange-600">*</span>
          </FieldLabel>
          <Input id="email"  type="email" placeholder="votre@email.com"  value={email} onChange={(event) => setEmail(event.target.value)}  className="h-11" />
          {errors.email && ( <p className="text-red-500 text-sm mt-1">{errors.email}</p> )}
        </Field>

        <Field className="w-11/12 max-w-md mt-4">
          <FieldLabel htmlFor="password">
            Mot de passe <span className="text-orange-600">*</span>
          </FieldLabel>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
          {errors.password && ( <p className="text-red-500 text-sm mt-1">{errors.password}</p> )}
        </Field>

        <div className="w-11/12 max-w-md mt-8">
          <Button type="submit" className="w-full">Connexion</Button>
        </div>

      </form>
    </>
  );
}

export default AdminLogin;