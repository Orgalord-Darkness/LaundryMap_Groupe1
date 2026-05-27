import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { useForm }  from "react-hook-form";
import { Button } from "@/components/ui/button";

export default function SignalementForm() {
  const { register, handleSubmit } = useForm();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="btn">Ouvrir le formulaire de signalement</button>
      </DrawerTrigger>
      <DrawerContent>
        <h2 className="text-lg font-bold">Formulaire de signalement</h2>
        <form onSubmit={handleSubmit((data) => console.log(data))}>
            <div className="mb-4">
                <label>Motif</label>
                <select {...register("motif")} className="input">
                    <option value="propos">Propos injurieux</option>
                    <option value="spam">Spam</option>
                    <option value="publicite">Publicité</option>
                    <option value="autre">Autre</option>
                </select>
            </div>
            <div className="mb-4">
                <label>Description</label>
                <textarea {...register("description")} className="input"></textarea>
            </div>
            <div className="flex justify-end">
                <Button variant="danger" type="submit">Signaler</Button>
                <Button variant="outline" type="button" className="ml-2">
                    Annuler
                </Button>
            </div>

        </form>
      </DrawerContent>
    </Drawer>
  );
}