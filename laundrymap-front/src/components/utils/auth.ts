export type Role = "guest" | "utilisateur" | "professionnel" | "administrateur";

export function getRoleFromSymfonyRoles(roles: string[]): Role {
    if (roles.includes("ROLE_ADMIN")) return "administrateur"
    if (roles.includes("ROLE_PRO")) return "professionnel"
    if (roles.includes("ROLE_USER") || roles.includes("utilisateur")) return "utilisateur"
    return "guest"
}
