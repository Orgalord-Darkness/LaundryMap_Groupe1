import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/components/context/AuthContext";
import axios from 'axios';
import { RedirectDialog } from "@/components/ui/RedirectDialog";
import { useTranslation } from "react-i18next"



function AdminLogin() {
  
  const { t } = useTranslation()
  const { login } = useAuth();

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/login_check`;

  const [redirectOpen, setRedirectOpen] = useState(false);
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
      setRedirectOpen(true);
    }
  };


  return (
    <>

      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 lg:gap-0 p-6 md:p-10">

          <div className="flex justify-center gap-2">
            <a href="https://ec2e.com/" target="_blank" className="flex items-center gap-2 font-medium">
              <img src="../public/logo_ec2e.png"  alt="Image" className="w-82" />
            </a>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t("connexion")}</h1>
                    <p className="text-sm text-balance text-muted-foreground"> {t("connexion")}  {t("en_tant_que_administrateur")} </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                    <Input id="email" type="email" placeholder="adm@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    {errors.email && ( <p className="text-red-500 text-sm mt-1">{errors.email}</p> )}
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">{t("mot_de_passe")}</FieldLabel>
                    </div>
                    <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    {errors.password && ( <p className="text-red-500 text-sm mt-1">{errors.password}</p> )}
                  </Field>

                  <Field>
                    <Button type="submit">{t("connexion")}</Button>
                  </Field>

                </FieldGroup>

                <RedirectDialog
                  open={redirectOpen}
                  title="Connexion réussie !"
                  message="Vous êtes maintenant connecté en tant qu'administrateur."
                  destinationLabel="votre tableau de bord"
                  duration={1500}
                  onNavigate={() => navigate("/admin/dashboard")}
                />

              </form>

            </div>
          </div>
        </div>

     
        <div className="relative hidden bg-muted lg:block">
          <img src="../public/laundry_cartoon.jpg" alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
        </div>

      </div>


    </>
  );
}

export default AdminLogin;