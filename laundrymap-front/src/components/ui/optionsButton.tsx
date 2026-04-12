import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
 
interface Props {
  id: number
  onDeleted?: () => void
  onEdit?: () => void
  name: string, 
}

export function LaverieActions({ id, onDeleted, onEdit, name }: Props) {
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    console.log(loading); 
    try {
      setLoading(true)
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/v1/laverie/suppression/${id}`);
      onDeleted?.()
      setOpenDelete(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            ⋮
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            Éditer
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-white-600"
            onClick={() => setOpenDelete(true)}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{name}</strong> ?
            </DialogDescription>
          </DialogHeader>

            <DialogFooter variant="delete">
                <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => setOpenDelete(false)}
                >
                    Annuler
                </Button>

                <Button
                    className="w-full"
                    variant="danger"
                    onClick={handleDelete}
                >
                    Supprimer
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}