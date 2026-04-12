import { useGoogleLogin } from "@react-oauth/google"
import GoogleButton from "@/components/ui/GoogleButton"
import { useAuth } from "@/components/context/AuthContext"

export default function GoogleLoginButton({
    onSuccess,
    title,
    route
}: {
    onSuccess?: () => void
    title: string
    route: string
}) {
    const { login } = useAuth()

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const r = await fetch(route, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: tokenResponse.code })
                })

                const contentType = r.headers.get("content-type")
                if (!contentType || !contentType.includes("application/json")) {
                    console.error("Réponse non JSON :", await r.text())
                    return
                }

                if (!r.ok) {
                    const erreur = await r.json()
                    console.error("Erreur backend :", erreur)
                    return
                }

                const data = await r.json()
                login(data.token_data)
                onSuccess?.()

            } catch (error) {
                console.error("Erreur Google login :", error)
            }
        },
        onError: () => console.error("Erreur Google OAuth"),
        flow: "auth-code"
    })

    return (
        <GoogleButton onClick={() => googleLogin()} title={title} />
    )
}