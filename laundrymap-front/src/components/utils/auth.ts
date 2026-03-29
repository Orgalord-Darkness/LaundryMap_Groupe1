import { jwtDecode } from "jwt-decode";  

export type Role = "guest" | "utilisateur" | "professionnel" | "administrateur";

export function getRoleFromToken(token: string | null): Role {
    if (!token) return "guest"
    try {
        const decoded = jwtDecode<{ roles: string[], username: string }>(token)
        const roles = decoded.roles ?? []
        console.log("Roles dans le token auth.ts:", roles) 

        if (roles.includes("ROLE_ADMIN")) {
            return "administrateur"
        }
        if (roles.includes("ROLE_PRO")) {
            return "professionnel"
        }
        if (roles.includes("utilisateur")) {
            return "utilisateur"
        }
        if (roles.includes("ROLE_USER")) {
            return "utilisateur"
        }
        return "guest"
    } catch {
        return "guest"
    }
}
