import { useGoogleLogin } from "@react-oauth/google"

    export default function GoogleLoginButton() {   
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            fetch("http://localhost:8080/api/v1/utilisateur/inscription/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenResponse.code })
            })
        },
        flow: "auth-code"
    })

    return <button onClick={() => login()}>Se connecter avec Google</button>
}   