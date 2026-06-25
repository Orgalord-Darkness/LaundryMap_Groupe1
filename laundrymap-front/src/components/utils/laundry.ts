export interface Machine {
  name: string
  capacity: number
  duration: number
  price: number
  available: boolean
  type?: string
  equipement_reference?: number | null
}

//  Pour ajout laverie et le composant AddMachineModal