import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";



function AdminLogin() {


  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/login`

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

  // Soumission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {

      fetch(url, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Identifiants invalides");
          return response.json();
        })
        .then((data) => {
          localStorage.setItem("admin_token", data.token);
          window.location.href = "/admin/dashboard";
        })
        .catch(() => {
          setErrors({ email: "", password: "Email ou mot de passe incorrect" });
        });
    }
  };

  return (
    <>


      <form onSubmit={handleSubmit} className="flex flex-col items-center p-4">

        <h1 className="font-bold text-2xl mt-6">Connexion</h1>
        <p className="text-gray-500 text-center mt-2">
          Se connecter en tant qu'administrateur
        </p>

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